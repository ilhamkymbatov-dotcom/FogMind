import { Flame } from 'lucide-react'
import { useStreak } from '../context/StreakContext'
import { useTranslation } from '../i18n'
import styles from './StreakBadge.module.css'

/**
 * The streak in the top bar: a flame and a count.
 *
 * Only the number is shown, with the sentence carried on the label, because the
 * bar has to hold an email address and a language switcher at 360px too. A
 * streak of zero stays muted rather than shouting about what is missing.
 */
export function StreakBadge() {
  const { currentStreak, loading } = useStreak()
  const { t, plural } = useTranslation()

  // Nothing to say until the history has loaded.
  if (loading) return null

  const running = currentStreak > 0
  const label = running
    ? t('streak.aria', { count: currentStreak, unit: plural('streak.dayUnit', currentStreak) })
    : t('streak.ariaNone')

  return (
    <span
      className={[styles.badge, running ? styles.running : styles.idle].join(' ')}
      title={label}
      aria-label={label}
    >
      <Flame size={15} aria-hidden="true" />
      <span className={styles.count}>{currentStreak}</span>
    </span>
  )
}
