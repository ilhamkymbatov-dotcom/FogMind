import { Check } from 'lucide-react'
import { useTranslation, type TranslationKey } from '../../../i18n'
import { useDemoLoop } from './useDemoLoop'
import styles from './MiniQuestionDemo.module.css'

/*
 * A miniature of the real question panel. Same parts as the app: a counter, a
 * prompt with an inline blank, and options that resolve to one calm correct
 * answer. The loop reads the question, fills the blank and settles on the
 * answer, then starts over.
 *
 * The prompt carries the same _____ marker the app uses, so translators keep
 * one string and the slot lands wherever the sentence needs it.
 */

const BLANK = '_____'
const STEPS = 4

const OPTIONS: readonly { key: TranslationKey; correct: boolean }[] = [
  { key: 'demo.q.a1', correct: false },
  { key: 'demo.q.a2', correct: true },
  { key: 'demo.q.a3', correct: false },
]

export function MiniQuestionDemo() {
  const { t } = useTranslation()
  const { ref, step, reduced } = useDemoLoop(STEPS, 1500)

  // 0 reading, 1 considering, 2 answered, 3 settled on the answer.
  const answered = step >= 2
  const [before, after] = t('demo.q.prompt').split(BLANK)

  return (
    <div
      ref={ref}
      className={[styles.card, reduced ? styles.still : ''].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <div className={styles.head}>
        <span className={styles.counter}>{t('panel.questionOf', { n: 2, total: 6 })}</span>
        <span className={styles.difficulty}>{t('panel.difficulty.2')}</span>
      </div>

      <p className={styles.prompt}>
        {before}
        <span className={[styles.slot, answered ? styles.slotFilled : ''].filter(Boolean).join(' ')}>
          {answered ? t('demo.q.answer') : ''}
        </span>
        {after}
      </p>

      <div className={styles.options}>
        {OPTIONS.map(({ key, correct }, index) => {
          const considering = step === 1 && index === 1
          const revealed = answered && correct
          const dimmed = answered && !correct
          return (
            <span
              key={key}
              className={[
                styles.option,
                considering ? styles.optionHover : '',
                revealed ? styles.optionCorrect : '',
                dimmed ? styles.optionDim : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles.optionLabel}>{t(key)}</span>
              {revealed ? <Check size={15} aria-hidden="true" className={styles.tick} /> : null}
            </span>
          )
        })}
      </div>

      <p className={[styles.verdict, answered ? styles.verdictOn : ''].filter(Boolean).join(' ')}>
        {t('panel.correct')}
      </p>
    </div>
  )
}
