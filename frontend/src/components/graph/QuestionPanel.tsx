import { useEffect, useMemo, useState } from 'react'
import { CircleCheck, X } from 'lucide-react'
import type { Node, ProgressState, Question } from '@fogmind/backend'
import { Button } from '../Button'
import styles from './QuestionPanel.module.css'

interface QuestionPanelProps {
  node: Node
  questions: Question[]
  onAnswer: (correct: boolean, nextState?: ProgressState) => Promise<void>
  onClose: () => void
}

const DIFFICULTY_LABEL: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }

function optionsOf(question: Question): string[] {
  return Array.isArray(question.options) ? question.options.map((o) => String(o)) : []
}

/**
 * Fisher-Yates. The stored options are alphabetized, which parked the correct
 * answer in the same slot across questions; shuffling on display fixes that.
 * Memoized per question id, so the order is stable while a question is open.
 */
function shuffled(values: string[]): string[] {
  const out = [...values]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function QuestionPanel({ node, questions, onAnswer, onClose }: QuestionPanelProps) {
  const [correctIds, setCorrectIds] = useState<Set<string>>(new Set())
  const [picked, setPicked] = useState<string | null>(null)
  const [result, setResult] = useState<'idle' | 'right' | 'wrong'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // The current question stays fixed while feedback shows; it only advances
  // when the user presses Next, which is when it enters the correct set.
  const current = useMemo(
    () => questions.find((q) => !correctIds.has(q.id)),
    [questions, correctIds],
  )
  const done = questions.length > 0 && !current
  const isLast = current ? correctIds.size === questions.length - 1 : false

  // Shuffled once per question view; keyed by id so it never reshuffles while
  // the question is on screen.
  const displayOptions = useMemo(
    () => (current ? shuffled(optionsOf(current)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current?.id],
  )

  async function choose(option: string) {
    if (!current || result === 'right') return
    const correct = option === current.correct_answer
    setPicked(option)
    setResult(correct ? 'right' : 'wrong')
    setError(null)

    const nextState: ProgressState | undefined = correct
      ? isLast
        ? 'mastered'
        : 'revealed'
      : undefined
    try {
      await onAnswer(correct, nextState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your progress.')
    }
  }

  function next() {
    if (current && result === 'right') {
      setCorrectIds((prev) => new Set(prev).add(current.id))
    }
    setPicked(null)
    setResult('idle')
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`Questions for ${node.title}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.nodeTitle}>{node.title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {done ? (
          <div className={styles.done}>
            <CircleCheck className={styles.doneIcon} size={32} aria-hidden="true" />
            <p className={styles.doneTitle}>Node mastered</p>
            <p className={styles.doneBody}>
              The fog has cleared here. Connected nodes are now ready to open.
            </p>
            <Button variant="primary" className={styles.next} onClick={onClose}>
              Back to the map
            </Button>
          </div>
        ) : current ? (
          <>
            <div className={styles.meta}>
              <span>
                Question {correctIds.size + 1} of {questions.length}
              </span>
              <span>{DIFFICULTY_LABEL[current.difficulty]}</span>
            </div>
            {/* Keyed by question id so each question slides in fresh. */}
            <div key={current.id} className={styles.questionBlock}>
              <p className={styles.prompt}>{current.prompt}</p>
              <div className={styles.options}>
                {displayOptions.map((option) => {
                  const isPicked = picked === option
                  const cls = [
                    styles.option,
                    isPicked && result === 'right' ? styles.optionRight : '',
                    isPicked && result === 'wrong' ? styles.optionWrong : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
                  return (
                    <button
                      key={option}
                      type="button"
                      className={cls}
                      onClick={() => choose(option)}
                      disabled={result === 'right'}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>

            {result === 'right' ? (
              <div className={`${styles.feedback} ${styles.feedbackRight}`} role="status">
                <CircleCheck size={16} aria-hidden="true" />
                Correct
              </div>
            ) : result === 'wrong' ? (
              <div className={`${styles.feedback} ${styles.feedbackWrong}`} role="status">
                Not quite. Try again.
              </div>
            ) : null}

            {error ? <p className={styles.error}>{error}</p> : null}

            {result === 'right' ? (
              <div className={styles.actions}>
                <Button variant="primary" className={styles.next} onClick={next}>
                  {isLast ? 'Finish' : 'Next question'}
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          <p className={styles.doneBody}>This node has no questions yet.</p>
        )}
      </div>
    </div>
  )
}
