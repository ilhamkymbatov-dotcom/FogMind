import { useEffect, useMemo, useState } from 'react'
import { Check, CircleCheck, X } from 'lucide-react'
import type { Question } from '@fogmind/backend'
import { Button } from '../Button'
import styles from './QuestionPanel.module.css'

interface QuestionPanelProps {
  title: string
  questions: Question[]
  /** Persists the answer, returns whether it was correct. */
  onAnswer: (question: Question, chosenOption: string) => Promise<boolean>
  onClose: () => void
  /** Copy for the completion screen. */
  doneTitle: string
  doneBody: string
}

const DIFFICULTY_LABEL: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }
const BLANK = '_____'

function optionsOf(question: Question): string[] {
  return Array.isArray(question.options) ? question.options.map((o) => String(o)) : []
}

/** Fisher-Yates, stable per question view so options never reshuffle mid view. */
function shuffled(values: string[]): string[] {
  const out = [...values]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function QuestionPanel({ title, questions, onAnswer, onClose, doneTitle, doneBody }: QuestionPanelProps) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const current = questions[index]
  const done = index >= questions.length
  const answered = picked !== null

  const displayOptions = useMemo(
    () => (current ? shuffled(optionsOf(current)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current?.id],
  )

  async function choose(option: string) {
    if (answered || saving || !current) return
    setSaving(true)
    setError(null)
    try {
      await onAnswer(current, option)
      setPicked(option)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your answer.')
    } finally {
      setSaving(false)
    }
  }

  function next() {
    setPicked(null)
    setError(null)
    setIndex((i) => i + 1)
  }

  // After answering, show the sentence completed with the correct word.
  const filled = useMemo(() => {
    if (!current) return null
    const [before, after] = current.prompt.split(BLANK)
    return { before, after: after ?? '' }
  }, [current])

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.nodeTitle}>{title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {done ? (
          <div className={styles.done}>
            <CircleCheck className={styles.doneIcon} size={32} aria-hidden="true" />
            <p className={styles.doneTitle}>{doneTitle}</p>
            <p className={styles.doneBody}>{doneBody}</p>
            <Button variant="primary" className={styles.next} onClick={onClose}>
              Back to the map
            </Button>
          </div>
        ) : current ? (
          <div key={current.id} className={styles.questionBlock}>
            <div className={styles.meta}>
              <span>
                Question {index + 1} of {questions.length}
              </span>
              <span>{DIFFICULTY_LABEL[current.difficulty]}</span>
            </div>

            <p className={styles.prompt}>
              {answered && filled ? (
                <>
                  {filled.before}
                  <span className={styles.filled}>{current.correct_answer}</span>
                  {filled.after}
                </>
              ) : (
                current.prompt
              )}
            </p>

            <div className={styles.options}>
              {displayOptions.map((option) => {
                const isCorrect = option === current.correct_answer
                const isPicked = option === picked
                const cls = [
                  styles.option,
                  answered && isCorrect ? styles.optionCorrect : '',
                  answered && isPicked && !isCorrect ? styles.optionWrong : '',
                ]
                  .filter(Boolean)
                  .join(' ')
                return (
                  <button
                    key={option}
                    type="button"
                    className={cls}
                    onClick={() => choose(option)}
                    disabled={answered || saving}
                  >
                    <span>{option}</span>
                    {answered && isCorrect ? <Check size={16} aria-hidden="true" /> : null}
                    {answered && isPicked && !isCorrect ? <X size={16} aria-hidden="true" /> : null}
                  </button>
                )
              })}
            </div>

            {answered ? (
              <div
                className={[styles.feedback, picked === current.correct_answer ? styles.feedbackRight : styles.feedbackWrong].join(' ')}
                role="status"
              >
                {picked === current.correct_answer ? 'Correct' : 'The correct answer is shown above'}
              </div>
            ) : null}

            {error ? <p className={styles.error}>{error}</p> : null}

            {answered ? (
              <div className={styles.actions}>
                <Button variant="primary" className={styles.next} onClick={next}>
                  {index + 1 >= questions.length ? 'Finish' : 'Next question'}
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className={styles.doneBody}>There are no questions to show.</p>
        )}
      </div>
    </div>
  )
}
