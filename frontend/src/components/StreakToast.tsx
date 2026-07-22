import { useEffect } from 'react'
import { Flame, X } from 'lucide-react'
import { useStreak } from '../context/StreakContext'
import { useTranslation } from '../i18n'
import styles from './StreakToast.module.css'

const VISIBLE_MS = 5200

/**
 * A short, quiet acknowledgement the first time the reader answers on a given
 * day. It never blocks anything, dismisses itself, and shows at most once a
 * day because the context records the day it last celebrated.
 *
 * Announced politely rather than assertively: this is good news, not something
 * that should interrupt whatever a screen reader is in the middle of saying.
 */
export function StreakToast() {
  const { celebration, dismissCelebration } = useStreak()
  const { t } = useTranslation()

  useEffect(() => {
    if (celebration === null) return
    const timer = window.setTimeout(dismissCelebration, VISIBLE_MS)
    return () => window.clearTimeout(timer)
  }, [celebration, dismissCelebration])

  if (celebration === null) return null

  const heading =
    celebration <= 1 ? t('streak.celebrateFirst') : t('streak.celebrate', { count: celebration })

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={styles.icon}>
        <Flame size={17} aria-hidden="true" />
      </span>
      <span className={styles.text}>
        <strong className={styles.heading}>{heading}</strong>
        <span className={styles.body}>{t('streak.celebrateBody')}</span>
      </span>
      <button
        type="button"
        className={styles.close}
        onClick={dismissCelebration}
        aria-label={t('common.close')}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
