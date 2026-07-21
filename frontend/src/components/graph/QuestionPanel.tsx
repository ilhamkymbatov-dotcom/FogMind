import { useEffect, useMemo, useState } from 'react'
import { Check, CircleCheck, X } from 'lucide-react'
import type { Question } from '@fogmind/backend'
import { useTranslation, type TranslationKey } from '../../i18n'
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

const BLANK = '_____'
const CLOSE_MS = 160

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
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<TranslationKey | null>(null)
  const [closing, setClosing] = useState(false)

  const requestClose = () => {
    setClosing(true)
    window.setTimeout(onClose, CLOSE_MS)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const current = questions[index]
  const done = index >= questions.length
  const answered = picked !== null

  const displayOptions = useMemo(
    () => (current ? shuffled(optionsOf(current)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current?.id],
  )

  const parts = useMemo(() => {
    if (!current) return null
    const [before, after] = current.prompt.split(BLANK)
    return { before, after: after ?? '' }
  }, [current])

  async function choose(option: string) {
    if (answered || saving || !current) return
    setSaving(true)
    setError(null)
    try {
      await onAnswer(current, option)
      setPicked(option)
    } catch {
      setError('panel.errSave')
    } finally {
      setSaving(false)
    }
  }

  function next() {
    setPicked(null)
    setError(null)
    setIndex((i) => i + 1)
  }

  return (
    <div
      className={[styles.overlay, closing ? styles.overlayClosing : ''].filter(Boolean).join(' ')}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose()
      }}
    >
      <div className={[styles.panel, closing ? styles.panelClosing : ''].filter(Boolean).join(' ')}>
        <div className={styles.header}>
          <h2 className={styles.nodeTitle}>{title}</h2>
          <button type="button" className={styles.close} onClick={requestClose} aria-label={t('common.close')}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {done ? (
          <div className={styles.done}>
            <CircleCheck className={styles.doneIcon} size={32} aria-hidden="true" />
            <p className={styles.doneTitle}>{doneTitle}</p>
            <p className={styles.doneBody}>{doneBody}</p>
            <Button variant="primary" className={styles.next} onClick={requestClose}>
              {t('panel.backToMap')}
            </Button>
          </div>
        ) : current && parts ? (
          <div key={current.id} className={styles.questionBlock}>
            <div className={styles.meta}>
              <span>{t('panel.questionOf', { n: index + 1, total: questions.length })}</span>
              <span>{t(`panel.difficulty.${current.difficulty}` as TranslationKey)}</span>
            </div>

            <p className={styles.prompt}>
              {parts.before}
              <span
                className={[styles.slot, answered ? styles.slotFilled : ''].filter(Boolean).join(' ')}
                style={{ minWidth: `${Math.max(current.correct_answer.length, 3)}ch` }}
              >
                {answered ? current.correct_answer : ''}
              </span>
              {parts.after}
            </p>

            <div className={styles.options}>
              {displayOptions.map((option) => {
                const isCorrect = option === current.correct_answer
                const isPicked = option === picked
                const cls = [
                  styles.option,
                  answered && isCorrect ? styles.optionCorrect : '',
                  answered && isPicked && !isCorrect ? styles.optionWrong : '',
                  answered && !isCorrect && !isPicked ? styles.optionMuted : '',
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
                {picked === current.correct_answer ? (
                  <>
                    <Check size={16} aria-hidden="true" />
                    {t('panel.correct')}
                  </>
                ) : (
                  t('panel.correctShown')
                )}
              </div>
            ) : null}

            {error ? <p className={styles.error}>{t(error)}</p> : null}

            {answered ? (
              <div className={styles.actions}>
                <Button variant="primary" className={styles.next} onClick={next}>
                  {index + 1 >= questions.length ? t('panel.finish') : t('panel.next')}
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className={styles.doneBody}>{t('panel.noQuestions')}</p>
        )}
      </div>
    </div>
  )
}
