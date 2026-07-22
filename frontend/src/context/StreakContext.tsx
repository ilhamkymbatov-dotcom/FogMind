import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { listActivityDates, recordActivityDay } from '@fogmind/backend'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'
import { computeStreak, localDateKey, recentDays, type DaySlot } from '../lib/streak'

/**
 * The learning streak: which days the reader has been active, and what that
 * adds up to.
 *
 * Recording is driven from the answer path and has to be free to call on every
 * single answer, so the write is guarded twice. In memory, a day already known
 * to be active never reaches the network at all, which means one write per day
 * per session rather than one per answer. In the database, the unique
 * (user_id, activity_date) pair makes a repeat a no op anyway, which covers two
 * tabs answering at once.
 *
 * Counts are always derived from the stored dates, never stored themselves, so
 * they cannot drift from the days they describe.
 */

interface StreakValue {
  currentStreak: number
  longestStreak: number
  activeToday: boolean
  /** True while a missed day is being held open inside the live run. */
  freezeUsed: boolean
  /** The last seven days, oldest first, for the week view. */
  days: DaySlot[]
  loading: boolean
  /** Cheap and idempotent. Call whenever an answer is given. */
  markActiveToday: () => void
  /** The streak to celebrate, set once on the day it grows. */
  celebration: number | null
  dismissCelebration: () => void
}

const StreakContext = createContext<StreakValue | null>(null)

/** Remembers the last day we celebrated, so the toast shows once per day. */
const CELEBRATED_KEY = 'fogmind.streak.celebrated'

function readCelebrated(): string | null {
  try {
    return window.localStorage.getItem(CELEBRATED_KEY)
  } catch {
    // Private browsing can make localStorage throw; the toast simply repeats.
    return null
  }
}

function writeCelebrated(date: string): void {
  try {
    window.localStorage.setItem(CELEBRATED_KEY, date)
  } catch {
    // Best effort only.
  }
}

export function StreakProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [dates, setDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [celebration, setCelebration] = useState<number | null>(null)
  // Guards a write already in flight, so a burst of answers cannot race.
  const writing = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!userId) {
      setDates([])
      setLoading(false)
      return
    }
    setLoading(true)
    listActivityDates(supabase)
      .then((rows) => {
        if (!cancelled) setDates(rows)
      })
      .catch(() => {
        // The streak is an encouragement, not a feature the app depends on.
        // If it cannot load, show nothing rather than an error.
        if (!cancelled) setDates([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const today = localDateKey()

  const summary = useMemo(() => computeStreak(dates, today), [dates, today])
  const days = useMemo(() => recentDays(dates, today, 7), [dates, today])

  const markActiveToday = useCallback(() => {
    if (!userId) return
    // Already active today, or already writing it: nothing to do and nothing
    // to send. This is the path almost every answer takes.
    if (dates.includes(today) || writing.current === today) return

    writing.current = today
    const next = [...dates, today]
    setDates(next)

    // Celebrate the first answer of a day, at most once per day.
    const grown = computeStreak(next, today).currentStreak
    if (readCelebrated() !== today) {
      writeCelebrated(today)
      setCelebration(grown)
    }

    recordActivityDay(supabase, { user_id: userId, activity_date: today })
      .catch(() => {
        // Put it back rather than showing a streak that was never saved.
        setDates((prev) => prev.filter((d) => d !== today))
        setCelebration(null)
      })
      .finally(() => {
        writing.current = null
      })
  }, [userId, dates, today])

  const dismissCelebration = useCallback(() => setCelebration(null), [])

  const value = useMemo<StreakValue>(
    () => ({
      currentStreak: summary.currentStreak,
      longestStreak: summary.longestStreak,
      activeToday: summary.activeToday,
      freezeUsed: summary.freezeUsedInCurrentStreak,
      days,
      loading,
      markActiveToday,
      celebration,
      dismissCelebration,
    }),
    [summary, days, loading, markActiveToday, celebration, dismissCelebration],
  )

  return <StreakContext.Provider value={value}>{children}</StreakContext.Provider>
}

export function useStreak(): StreakValue {
  const ctx = useContext(StreakContext)
  if (!ctx) throw new Error('useStreak must be used inside StreakProvider')
  return ctx
}
