/**
 * The learning streak, derived from the set of days the reader was active.
 *
 * Everything here is pure and deterministic: same dates plus same "today" gives
 * the same answer, with no clock reads and no I/O. That is what makes the rules
 * below checkable rather than a thing you have to trust.
 *
 * Dates are plain calendar days written YYYY-MM-DD, never timestamps. A day is
 * turned into a day number through Date.UTC on its parsed parts, which is safe
 * precisely because UTC has no daylight saving: the arithmetic is on calendar
 * squares, not on instants. Reading the reader's own local date at the edges
 * and doing pure day arithmetic in the middle is what keeps a session at
 * eleven at night from being filed under tomorrow.
 *
 * The rules:
 *
 *   Active day   a calendar day with at least one answered question. Answering
 *                is the whole bar: not signing in, not mastering anything.
 *
 *   Streak       consecutive active days. A gap of exactly one missed day is
 *                bridged by the freeze and does not break the run. Two missed
 *                days in a row always break it.
 *
 *   Counting     the streak counts active days. A bridged day was not studied,
 *                so it holds the run together without adding to it. Six days
 *                studied around one covered gap reads as six, not seven.
 *
 *   Still alive  the run survives while the last active day is today,
 *                yesterday, or the day before yesterday. That last case is a
 *                freeze already holding yesterday open; one more missed day
 *                ends it.
 */

export interface StreakSummary {
  /** Active days in the run ending now, or 0 once the run has broken. */
  currentStreak: number
  /** The best run ever reached, by the same counting rule. */
  longestStreak: number
  /** Whether today already counts. */
  activeToday: boolean
  /** Whether a missed day is currently being covered inside the live run. */
  freezeUsedInCurrentStreak: boolean
}

/** How a single day reads in the week view. */
export type DayKind = 'active' | 'bridged' | 'missed'

export interface DaySlot {
  date: string
  kind: DayKind
  isToday: boolean
}

const MS_PER_DAY = 86_400_000

/** The reader's own calendar day for a moment, as YYYY-MM-DD. */
export function localDateKey(at: Date = new Date()): string {
  const year = at.getFullYear()
  const month = `${at.getMonth() + 1}`.padStart(2, '0')
  const day = `${at.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** A calendar day as a day number. Pure arithmetic, no local clock involved. */
export function toDayNumber(date: string): number {
  const [year, month, day] = date.split('-').map(Number)
  return Date.UTC(year, month - 1, day) / MS_PER_DAY
}

/** The inverse, so the week view can name the days it is about to draw. */
export function fromDayNumber(dayNumber: number): string {
  return new Date(dayNumber * MS_PER_DAY).toISOString().slice(0, 10)
}

export function addDays(date: string, delta: number): string {
  return fromDayNumber(toDayNumber(date) + delta)
}

/**
 * Normalises the stored dates into a sorted, de duplicated list of day numbers,
 * dropping anything in the future. A future date can only come from a clock
 * that disagrees with the one that wrote it, and letting one through would
 * inflate the streak.
 */
function normalise(activeDates: readonly string[], todayNumber: number): number[] {
  const seen = new Set<number>()
  for (const date of activeDates) {
    const n = toDayNumber(date)
    if (Number.isNaN(n) || n > todayNumber) continue
    seen.add(n)
  }
  return [...seen].sort((a, b) => a - b)
}

/**
 * How two adjacent active days relate.
 * 1 is consecutive, 2 is one missed day the freeze can bridge, anything more is
 * two or more missed days in a row and ends the run.
 */
const BRIDGEABLE_GAP = 2

export function computeStreak(activeDates: readonly string[], today: string): StreakSummary {
  const todayNumber = toDayNumber(today)
  const days = normalise(activeDates, todayNumber)

  if (days.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      activeToday: false,
      freezeUsedInCurrentStreak: false,
    }
  }

  const activeToday = days[days.length - 1] === todayNumber

  // Longest ever: walk forward, restarting whenever a gap is too wide to bridge.
  let longestStreak = 0
  let run = 0
  for (let i = 0; i < days.length; i++) {
    const gap = i === 0 ? Infinity : days[i] - days[i - 1]
    run = gap <= BRIDGEABLE_GAP ? run + 1 : 1
    if (run > longestStreak) longestStreak = run
  }

  // Current: only if the last active day is close enough that the run has not
  // already run out of freeze.
  const lastDay = days[days.length - 1]
  const sinceLast = todayNumber - lastDay
  if (sinceLast > BRIDGEABLE_GAP) {
    return { currentStreak: 0, longestStreak, activeToday, freezeUsedInCurrentStreak: false }
  }

  // A last active day two days back means yesterday is already being covered.
  let freezeUsedInCurrentStreak = sinceLast === BRIDGEABLE_GAP
  let currentStreak = 1
  for (let i = days.length - 1; i > 0; i--) {
    const gap = days[i] - days[i - 1]
    if (gap > BRIDGEABLE_GAP) break
    if (gap === BRIDGEABLE_GAP) freezeUsedInCurrentStreak = true
    currentStreak += 1
  }

  return { currentStreak, longestStreak, activeToday, freezeUsedInCurrentStreak }
}

/**
 * The last `count` days ending today, labelled for the week view.
 *
 * A day counts as bridged when it was missed but sits between two active days,
 * which is exactly the gap the freeze covers. Yesterday is also shown as
 * bridged while it is being held open by a live run that has not been renewed
 * today, so the reader can see the cover before they have used it.
 */
export function recentDays(
  activeDates: readonly string[],
  today: string,
  count = 7,
): DaySlot[] {
  const todayNumber = toDayNumber(today)
  const active = new Set(normalise(activeDates, todayNumber))
  const { currentStreak } = computeStreak(activeDates, today)

  const slots: DaySlot[] = []
  for (let offset = count - 1; offset >= 0; offset--) {
    const dayNumber = todayNumber - offset
    const isActive = active.has(dayNumber)

    let kind: DayKind = isActive ? 'active' : 'missed'
    if (!isActive) {
      const heldBetweenActiveDays = active.has(dayNumber - 1) && active.has(dayNumber + 1)
      const heldOpenRightNow =
        dayNumber === todayNumber - 1 && active.has(dayNumber - 1) && currentStreak > 0
      if (heldBetweenActiveDays || heldOpenRightNow) kind = 'bridged'
    }

    slots.push({ date: fromDayNumber(dayNumber), kind, isToday: dayNumber === todayNumber })
  }
  return slots
}
