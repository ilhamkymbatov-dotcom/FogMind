import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getDocument,
  listAnswersForQuestions,
  listEdgesForDocument,
  listNodesForDocument,
  listProgressForNodes,
  listQuestionsForNodes,
  updateProgress,
  upsertQuestionAnswer,
  resetProgressForDocument,
  type Document,
  type Edge,
  type Node,
  type Progress,
  type Question,
} from '@fogmind/backend'
import { supabase } from './supabase'
import { useStreak } from '../context/StreakContext'
import { errorKey } from '../i18n'
import type { TranslationKey } from '../i18n'
import {
  buildAdjacency,
  deriveStatus,
  startingNodeIds,
  summarize,
  type NodeStatus,
  type ProgressSummary,
} from './graphModel'

export interface NodeStats {
  answered: number
  correct: number
  total: number
}

export interface GraphGame {
  loading: boolean
  error: TranslationKey | null
  document: Document | null
  nodes: Node[]
  edges: Edge[]
  questionsByNode: Map<string, Question[]>
  statusOf: (nodeId: string) => NodeStatus
  statsOf: (nodeId: string) => NodeStats
  /** Questions of a node not yet answered, in order, for the main pass. */
  pendingQuestions: (nodeId: string) => Question[]
  /** Every question answered incorrectly, for the review round. */
  reviewQuestions: Question[]
  allCompleted: boolean
  summary: ProgressSummary
  userId: string | null
  /** Records one answer, upserts it, updates node progress, returns correctness. */
  recordAnswer: (question: Question, chosenOption: string) => Promise<boolean>
  /** Puts every node of this document back under the fog. */
  resetProgress: () => Promise<void>
}

export function useGraphGame(documentId: string | undefined): GraphGame {
  const { markActiveToday } = useStreak()
  const [document, setDocument] = useState<Document | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [questionsByNode, setQuestionsByNode] = useState<Map<string, Question[]>>(new Map())
  const [progressByNode, setProgressByNode] = useState<Map<string, Progress>>(new Map())
  const [answers, setAnswers] = useState<Map<string, boolean>>(new Map())
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<TranslationKey | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      if (!documentId) return
      setLoading(true)
      setError(null)
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const doc = await getDocument(supabase, documentId)
        if (!doc) throw new Error('err.docNotFound')
        const [nodeRows, edgeRows] = await Promise.all([
          listNodesForDocument(supabase, documentId),
          listEdgesForDocument(supabase, documentId),
        ])
        const nodeIds = nodeRows.map((n) => n.id)
        const [questionRows, progressRows] = await Promise.all([
          listQuestionsForNodes(supabase, nodeIds),
          listProgressForNodes(supabase, nodeIds),
        ])
        // Tolerate the answers table not existing yet (before migration 002 is
        // applied): treat as a fresh start rather than breaking the whole map.
        let answerRows: Awaited<ReturnType<typeof listAnswersForQuestions>> = []
        try {
          answerRows = await listAnswersForQuestions(
            supabase,
            questionRows.map((q) => q.id),
          )
        } catch {
          answerRows = []
        }
        if (!active) return
        const qMap = new Map<string, Question[]>()
        for (const q of questionRows) {
          const list = qMap.get(q.node_id) ?? []
          list.push(q)
          qMap.set(q.node_id, list)
        }
        setUserId(sessionData.session?.user.id ?? null)
        setDocument(doc)
        setNodes(nodeRows)
        setEdges(edgeRows)
        setQuestionsByNode(qMap)
        setProgressByNode(new Map(progressRows.map((p) => [p.node_id, p])))
        setAnswers(new Map(answerRows.map((a) => [a.question_id, a.is_correct])))
      } catch (err) {
        if (active) setError(errorKey(err))
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [documentId])

  const starting = useMemo(() => startingNodeIds(nodes, edges), [nodes, edges])
  const adjacency = useMemo(() => buildAdjacency(edges), [edges])

  const statsOf = useCallback(
    (nodeId: string): NodeStats => {
      const qs = questionsByNode.get(nodeId) ?? []
      let answered = 0
      let correct = 0
      for (const q of qs) {
        if (answers.has(q.id)) {
          answered += 1
          if (answers.get(q.id)) correct += 1
        }
      }
      return { answered, correct, total: qs.length }
    },
    [questionsByNode, answers],
  )

  const { completedSet, masteredSet } = useMemo(() => {
    const completed = new Set<string>()
    const mastered = new Set<string>()
    for (const node of nodes) {
      const qs = questionsByNode.get(node.id) ?? []
      if (qs.length === 0) continue
      let answered = 0
      let correct = 0
      for (const q of qs) {
        if (answers.has(q.id)) {
          answered += 1
          if (answers.get(q.id)) correct += 1
        }
      }
      if (answered === qs.length) {
        completed.add(node.id)
        if (correct === qs.length) mastered.add(node.id)
      }
    }
    return { completedSet: completed, masteredSet: mastered }
  }, [nodes, questionsByNode, answers])

  const statusOf = useCallback(
    (nodeId: string): NodeStatus => deriveStatus(nodeId, completedSet, masteredSet, starting, adjacency),
    [completedSet, masteredSet, starting, adjacency],
  )

  const pendingQuestions = useCallback(
    (nodeId: string): Question[] => (questionsByNode.get(nodeId) ?? []).filter((q) => !answers.has(q.id)),
    [questionsByNode, answers],
  )

  const reviewQuestions = useMemo(() => {
    const out: Question[] = []
    for (const node of nodes) {
      for (const q of questionsByNode.get(node.id) ?? []) {
        if (answers.get(q.id) === false) out.push(q)
      }
    }
    return out
  }, [nodes, questionsByNode, answers])

  const allCompleted = useMemo(
    () => nodes.length > 0 && nodes.every((n) => completedSet.has(n.id)),
    [nodes, completedSet],
  )

  const summary = useMemo(
    () => summarize(masteredSet.size, completedSet.size, nodes.length),
    [masteredSet, completedSet, nodes],
  )

  const recordAnswer = useCallback(
    async (question: Question, chosenOption: string): Promise<boolean> => {
      const isCorrect = chosenOption === question.correct_answer
      if (!userId) throw new Error('auth.err.sessionExpired')

      // Optimistic: update the answer map so the graph reacts immediately.
      const prevValue = answers.get(question.id)
      setAnswers((prev) => new Map(prev).set(question.id, isCorrect))

      try {
        await upsertQuestionAnswer(supabase, {
          user_id: userId,
          question_id: question.id,
          is_correct: isCorrect,
        })

        // Today counts the moment a question is answered, right or wrong. This
        // is a no op once the day is already recorded, so it costs nothing on
        // every answer after the first.
        markActiveToday()

        // Mirror the node level outcome onto its progress row so it persists in
        // the shape the rest of the app expects.
        const nodeId = question.node_id
        const qs = questionsByNode.get(nodeId) ?? []
        const nextAnswers = new Map(answers).set(question.id, isCorrect)
        let answered = 0
        let correct = 0
        for (const q of qs) {
          if (nextAnswers.has(q.id)) {
            answered += 1
            if (nextAnswers.get(q.id)) correct += 1
          }
        }
        const progress = progressByNode.get(nodeId)
        if (progress) {
          const nextState =
            answered === qs.length ? (correct === qs.length ? 'mastered' : 'revealed') : 'fogged'
          const updated: Progress = {
            ...progress,
            state: nextState,
            correct_count: correct,
            attempt_count: progress.attempt_count + 1,
            last_reviewed_at: new Date().toISOString(),
          }
          setProgressByNode((prev) => new Map(prev).set(nodeId, updated))
          await updateProgress(supabase, progress.id, {
            state: updated.state,
            correct_count: updated.correct_count,
            attempt_count: updated.attempt_count,
            last_reviewed_at: updated.last_reviewed_at,
          })
        }
        return isCorrect
      } catch (err) {
        // Roll back the optimistic answer so the UI matches the database.
        setAnswers((prev) => {
          const next = new Map(prev)
          if (prevValue === undefined) next.delete(question.id)
          else next.set(question.id, prevValue)
          return next
        })
        throw err instanceof Error ? err : new Error('panel.errSave')
      }
    },
    [answers, progressByNode, questionsByNode, userId, markActiveToday],
  )

  const resetProgress = useCallback(async (): Promise<void> => {
    if (!documentId) return
    await resetProgressForDocument(supabase, documentId)

    // Node status is derived from the answers, so emptying them is what
    // actually re fogs the map: nothing completed, nothing mastered, only the
    // starting node reachable. The progress rows are the persisted mirror and
    // are brought back into line here so a reload agrees with the screen.
    setAnswers(new Map())
    setProgressByNode((prev) => {
      const next = new Map<string, Progress>()
      for (const [nodeId, progress] of prev) {
        next.set(nodeId, {
          ...progress,
          state: 'fogged',
          correct_count: 0,
          attempt_count: 0,
          last_reviewed_at: null,
        })
      }
      return next
    })
  }, [documentId])

  return {
    loading,
    error,
    document,
    nodes,
    edges,
    questionsByNode,
    statusOf,
    statsOf,
    pendingQuestions,
    reviewQuestions,
    allCompleted,
    summary,
    userId,
    recordAnswer,
    resetProgress,
  }
}
