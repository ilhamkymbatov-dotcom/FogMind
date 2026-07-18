/**
 * Deterministic, rule based analysis. Turns extracted plain text into knowledge
 * graph data with no external calls and no randomness beyond node id minting.
 * The same text always yields the same graph shape.
 */
import type { QuestionDifficulty } from '@fogmind/backend'

export interface AnalyzedNode {
  id: string
  title: string
  summary: string
  position_x: number
  position_y: number
}

export interface AnalyzedEdge {
  source_node_id: string
  target_node_id: string
}

export interface AnalyzedQuestion {
  node_id: string
  prompt: string
  correct_answer: string
  options: string[]
  difficulty: QuestionDifficulty
}

export interface AnalysisResult {
  nodes: AnalyzedNode[]
  edges: AnalyzedEdge[]
  questions: AnalyzedQuestion[]
}

const MAX_NODES = 40
const MIN_SECTION_CHARS = 40
const SUMMARY_CHARS = 600
const KEYWORDS_PER_NODE = 8
const KEYWORD_EDGE_OVERLAP = 3
const MAX_QUESTIONS_PER_NODE = 3

// Stopwords across the three supported languages. Keyword extraction removes
// these so significant terms surface regardless of the script.
const EN_STOPWORDS =
  'the a an and or but if then than that this these those of to in on at for with without ' +
  'from by as is are was were be been being it its it s they them their he she his her you your ' +
  'we our i me my not no nor so such can could should would may might must will just also into ' +
  'over under about above below between out up down off again more most some any each other which ' +
  'who whom what when where why how all both few many much one two three'

const RU_STOPWORDS =
  'и в во не что он на я с со как а то все она так его но да ты к у же вы за бы по только ее мне ' +
  'было вот от меня еще нет о из ему теперь когда даже ну вдруг ли если уже или ни быть был него ' +
  'до вас нибудь опять уж вам ведь там потом себя ничего ей может они тут где есть надо ней для мы ' +
  'тебя их чем была сам чтоб без будто чего раз тоже себе под будет ж тогда кто этот того потому ' +
  'этого какой совсем ним здесь этом один почти мой тем чтобы нее сейчас были куда зачем всех ' +
  'никогда можно при наконец два об другой хоть после над больше тот через эти нас про всего них ' +
  'какая много разве три эту моя впрочем свою этой перед иногда лучше чуть том нельзя такой им ' +
  'более всегда конечно всю между это его ее их для от при так как также этих своих является были'

const KK_STOPWORDS =
  'бұл және де да мен пен бен үшін болып ол бір бар жоқ емес деп сол осы ма ме ба бе па пе ғой ' +
  'не кім қай қалай неге себебі сондықтан бірақ немесе әрі тағы сияқты ретінде дейін кейін ' +
  'арасында туралы менің сенің оның біздің сіздің оларды маған саған оған бізге сіз мынау анау ' +
  'ал әрбір әр барлық кейбір қандай мұнда сонда енді тек қана ғана болатын болды екен'

const STOPWORDS = new Set(`${EN_STOPWORDS} ${RU_STOPWORDS} ${KK_STOPWORDS}`.split(/\s+/))

interface Section {
  title: string
  body: string
}

function normalize(text: string): string {
  return text.replace(/\r\n?/g, '\n').replace(/\t/g, ' ').replace(/[ ]{2,}/g, ' ')
}

function isHeading(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  if (/^#{1,6}\s+/.test(trimmed)) return true
  // A short line with no sentence ending, likely a title.
  if (trimmed.length <= 60 && !/[.!?,:;]$/.test(trimmed) && trimmed.split(/\s+/).length <= 8) {
    const letters = trimmed.replace(/[^\p{L}]/gu, '')
    if (letters.length >= 3 && (trimmed === trimmed.toUpperCase() || /^[\p{Lu}]/u.test(trimmed))) {
      return true
    }
  }
  return false
}

function headingText(line: string): string {
  return line.trim().replace(/^#{1,6}\s+/, '').trim()
}

function firstSentence(body: string): string {
  const sentence = splitSentences(body)[0] ?? body
  const words = sentence.split(/\s+/).slice(0, 9).join(' ')
  return words.length > 60 ? `${words.slice(0, 57)}...` : words
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

/** Splits text into sections by headings, falling back to blank line blocks. */
function toSections(text: string): Section[] {
  const lines = text.split('\n')
  const hasHeadings = lines.some(isHeading)
  const sections: Section[] = []

  if (hasHeadings) {
    let current: Section | null = null
    for (const line of lines) {
      if (isHeading(line)) {
        if (current) sections.push(current)
        current = { title: headingText(line), body: '' }
      } else if (current) {
        current.body += line + '\n'
      } else if (line.trim()) {
        current = { title: '', body: line + '\n' }
      }
    }
    if (current) sections.push(current)
  } else {
    for (const block of text.split(/\n{2,}/)) {
      const body = block.trim()
      if (body) sections.push({ title: '', body })
    }
  }

  // Merge sections shorter than the minimum into the previous one, so stray
  // lines do not become their own nodes.
  const merged: Section[] = []
  for (const section of sections) {
    const clean = section.body.trim()
    if (!clean) continue
    if (clean.length < MIN_SECTION_CHARS && merged.length > 0) {
      merged[merged.length - 1].body += '\n' + clean
    } else {
      merged.push({ title: section.title, body: clean })
    }
  }

  // Fallback for prose with no headings and few or no blank lines: a page that
  // collapsed into one or two blocks is re chunked by sentence groups, so a
  // normal document still yields several nodes. Genuinely tiny input (a
  // sentence or two) is left as a single node.
  let result = merged
  if (result.length < 3) {
    const sentences = splitSentences(text)
    if (sentences.length >= 6 && text.trim().length >= 400) {
      const targetNodes = Math.min(8, Math.max(3, Math.round(sentences.length / 4)))
      result = chunkSentences(sentences, targetNodes)
    }
  }

  // Cap the node count by folding the tail into the last kept section.
  if (result.length > MAX_NODES) {
    const head = result.slice(0, MAX_NODES)
    const tail = result.slice(MAX_NODES)
    head[MAX_NODES - 1].body += '\n' + tail.map((s) => s.body).join('\n')
    return head
  }
  return result
}

/** Groups sentences into roughly equal chunks, one section each. */
function chunkSentences(sentences: string[], targetNodes: number): Section[] {
  const perChunk = Math.ceil(sentences.length / targetNodes)
  const sections: Section[] = []
  for (let i = 0; i < sentences.length; i += perChunk) {
    const body = sentences.slice(i, i + perChunk).join(' ').trim()
    if (body) sections.push({ title: '', body })
  }
  return sections
}

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[\p{L}]{3,}/gu) ?? []).filter((w) => !STOPWORDS.has(w))
}

/** The most frequent non stopword terms in a text, most frequent first. */
function keywordsOf(text: string, limit: number): string[] {
  const counts = new Map<string, number>()
  for (const word of tokenize(text)) {
    counts.set(word, (counts.get(word) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word)
}

function circularLayout(count: number, index: number): { x: number; y: number } {
  if (count <= 1) return { x: 0, y: 0 }
  const radius = 120 + count * 6
  const angle = (2 * Math.PI * index) / count
  return { x: Math.round(Math.cos(angle) * radius), y: Math.round(Math.sin(angle) * radius) }
}

function difficultyFor(sentenceWords: number, keyword: string): QuestionDifficulty {
  if (keyword.length >= 10 || sentenceWords >= 22) return 3
  if (keyword.length >= 7 || sentenceWords >= 14) return 2
  return 1
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * A Unicode aware whole word match. JS `\b` is ASCII only, so it never fires on
 * Cyrillic; lookarounds on \p{L} give a real word boundary in any script.
 */
function wordPattern(word: string): RegExp {
  return new RegExp(`(?<!\\p{L})${escapeRegExp(word)}(?!\\p{L})`, 'iu')
}

function blankOut(sentence: string, keyword: string): string {
  return sentence.replace(wordPattern(keyword), '_____')
}

/** Picks up to three distractors, preferring other nodes, then same node. */
function pickDistractors(
  distractorPool: string[],
  nodeKeywords: string[],
  answer: string,
  rotation: number,
): string[] {
  const pool = distractorPool.filter((d) => d !== answer)
  const chosen = pool.slice(rotation % Math.max(1, pool.length)).concat(pool)
  const distractors: string[] = []
  for (const candidate of [...chosen, ...nodeKeywords]) {
    if (candidate === answer || distractors.includes(candidate)) continue
    distractors.push(candidate)
    if (distractors.length >= 3) break
  }
  return distractors
}

function buildQuestions(
  nodeId: string,
  body: string,
  nodeKeywords: string[],
  distractorPool: string[],
  rotation: number,
): AnalyzedQuestion[] {
  const questions: AnalyzedQuestion[] = []
  const usedKeywords = new Set<string>()
  if (nodeKeywords.length === 0) return questions

  // Prefer well sized sentences, but fall back to any sentence so a node with a
  // usable keyword always yields at least one question.
  const allSentences = splitSentences(body)
  const sized = allSentences.filter((s) => {
    const words = s.split(/\s+/).length
    return words >= 4 && words <= 40
  })
  const candidates = sized.length > 0 ? sized : allSentences

  for (const sentence of candidates) {
    if (questions.length >= MAX_QUESTIONS_PER_NODE) break
    const lower = sentence.toLowerCase()
    const keyword = nodeKeywords.find((k) => !usedKeywords.has(k) && wordPattern(k).test(lower))
    if (!keyword) continue
    usedKeywords.add(keyword)

    const distractors = pickDistractors(distractorPool, nodeKeywords, keyword, rotation + questions.length)
    const options = [keyword, ...distractors].sort((a, b) => a.localeCompare(b))
    const words = sentence.split(/\s+/).length
    questions.push({
      node_id: nodeId,
      prompt: blankOut(sentence, keyword),
      correct_answer: keyword,
      options,
      difficulty: difficultyFor(words, keyword),
    })
  }

  return questions
}

export function analyze(text: string): AnalysisResult {
  const clean = normalize(text).trim()
  const sections = toSections(clean)
  if (sections.length === 0) {
    return { nodes: [], edges: [], questions: [] }
  }

  const nodes: AnalyzedNode[] = []
  const nodeKeywords: string[][] = []

  sections.forEach((section, index) => {
    const title = (section.title || firstSentence(section.body) || `Section ${index + 1}`).trim()
    const summary = section.body.slice(0, SUMMARY_CHARS).trim()
    const { x, y } = circularLayout(sections.length, index)
    nodes.push({
      id: crypto.randomUUID(),
      title: title.slice(0, 200),
      summary,
      position_x: x,
      position_y: y,
    })
    nodeKeywords.push(keywordsOf(section.body, KEYWORDS_PER_NODE))
  })

  // Edges: reading order plus keyword overlap, deduped on the unordered pair.
  const edges: AnalyzedEdge[] = []
  const seen = new Set<string>()
  const pairKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`)

  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({ source_node_id: nodes[i].id, target_node_id: nodes[i + 1].id })
    seen.add(pairKey(i, i + 1))
  }
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (seen.has(pairKey(i, j))) continue
      const overlap = nodeKeywords[i].filter((k) => nodeKeywords[j].includes(k)).length
      if (overlap >= KEYWORD_EDGE_OVERLAP) {
        edges.push({ source_node_id: nodes[i].id, target_node_id: nodes[j].id })
        seen.add(pairKey(i, j))
      }
    }
  }

  // Distractor pool: every keyword across all nodes, deduped and stable ordered.
  const distractorPool = [...new Set(nodeKeywords.flat())].sort()

  const questions: AnalyzedQuestion[] = []
  nodes.forEach((node, index) => {
    questions.push(
      ...buildQuestions(node.id, sections[index].body, nodeKeywords[index], distractorPool, index),
    )
  })

  return { nodes, edges, questions }
}
