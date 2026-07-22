import { Flame, ShieldCheck, Trophy } from 'lucide-react'
import { useStreak } from '../context/StreakContext'
import { useTranslation, type TranslationKey } from '../i18n'
import type { DayKind } from '../lib/streak'
import styles from './StreakCard.module.css'

const KIND_LABEL: Record<DayKind, TranslationKey> = {
  active: 'streak.dayActive',
  bridged: 'streak.dayBridged',
  missed: 'streak.dayMissed',
  upcoming: 'streak.dayUpcoming',
}

/** Weekday initials by getDay(), taken from the dictionary rather than Intl. */
const WEEKDAY_KEY: readonly TranslationKey[] = [
  'streak.wd0',
  'streak.wd1',
  'streak.wd2',
  'streak.wd3',
  'streak.wd4',
  'streak.wd5',
  'streak.wd6',
]

/**
 * Whether the runtime can actually name months in a language.
 *
 * supportedLocalesOf is not enough to answer this. It reports Kazakh as
 * supported on engines that carry the locale but not its month names, and Intl
 * then formats without complaint using the ICU root pattern, printing July as
 * the literal "M07". The only reliable check is to format a known month and
 * look at what comes back, so that is what this does, once.
 */
function hasMonthNames(locale: string): boolean {
  try {
    const probe = new Intl.DateTimeFormat(locale, { month: 'long' })
      .format(new Date(Date.UTC(2020, 6, 1)))
      .trim()
    return !/^M\d+$/.test(probe)
  } catch {
    return false
  }
}

/**
 * The week view on the dashboard: seven days, what happened on each, and what
 * it adds up to.
 *
 * Weekday initials come from Intl in the reader's own language rather than from
 * seven more translation keys per language, so they stay correct without
 * anybody maintaining them.
 */
export function StreakCard() {
  const { currentStreak, longestStreak, freezeUsed, days, loading } = useStreak()
  const { t, lang, plural } = useTranslation()

  if (loading) return null

  const longDate = hasMonthNames(lang)
    ? new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long' })
    : null

  /** Local midnight of a plain calendar day, so no timezone can shift it. */
  const asLocalDate = (date: string): Date => {
    const [year, month, day] = date.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const describeDate = (date: string): string => {
    if (longDate) return longDate.format(asLocalDate(date))
    const [, month, day] = date.split('-')
    return `${day}.${month}`
  }

  return (
    <section className={styles.card} aria-label={t('streak.title')}>
      <div className={styles.head}>
        <span className={styles.title}>
          <Flame size={16} aria-hidden="true" className={currentStreak > 0 ? styles.lit : undefined} />
          {t('streak.title')}
        </span>
        <span className={styles.best}>
          <Trophy size={14} aria-hidden="true" />
          {t('streak.longest')}: {longestStreak} {plural('streak.dayUnit', longestStreak)}
        </span>
      </div>

      <ol className={styles.week}>
        {days.map((slot) => {
          return (
            <li key={slot.date} className={styles.daySlot}>
              <span className={styles.dayName} aria-hidden="true">
                {t(WEEKDAY_KEY[slot.weekday])}
              </span>
              <span
                className={[
                  styles.mark,
                  styles[slot.kind],
                  slot.isToday ? styles.today : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                title={`${describeDate(slot.date)}: ${t(KIND_LABEL[slot.kind])}`}
              >
                <span className={styles.srOnly}>
                  {slot.isToday ? `${t('streak.today')}. ` : ''}
                  {describeDate(slot.date)}: {t(KIND_LABEL[slot.kind])}
                </span>
              </span>
            </li>
          )
        })}
      </ol>

      {currentStreak === 0 ? (
        <p className={styles.note}>{t('streak.empty')}</p>
      ) : (
        <p className={styles.count}>
          <strong className={styles.countNumber}>{currentStreak}</strong>
          <span className={styles.countLabel}>
            {plural('streak.dayUnit', currentStreak)} · {t('streak.current')}
          </span>
        </p>
      )}

      {freezeUsed ? (
        <p className={styles.freeze}>
          <ShieldCheck size={15} aria-hidden="true" />
          {t('streak.freezeNote')}
        </p>
      ) : null}
    </section>
  )
}
