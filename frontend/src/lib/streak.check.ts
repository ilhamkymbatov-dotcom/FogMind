import { computeStreak, currentWeek, addDays, weekdayOf } from './streak.ts'

const TODAY = '2026-07-22'
const d = (n: number) => addDays(TODAY, -n) // n days ago

let failures = 0
function check(name: string, got: unknown, want: unknown) {
  const g = JSON.stringify(got), w = JSON.stringify(want)
  const ok = g === w
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
  if (!ok) console.log(`        got  ${g}\n        want ${w}`)
}
const s = (dates: string[]) => {
  const r = computeStreak(dates, TODAY)
  return [r.currentStreak, r.longestStreak, r.activeToday, r.freezeUsedInCurrentStreak]
}

// 1. no activity
check('no activity', s([]), [0, 0, false, false])

// 2. single day (today)
check('single day, today', s([d(0)]), [1, 1, true, false])
check('single day, yesterday', s([d(1)]), [1, 1, false, false])

// 3. consecutive days
check('3 consecutive ending today', s([d(2), d(1), d(0)]), [3, 3, true, false])
check('5 consecutive ending yesterday', s([d(5), d(4), d(3), d(2), d(1)]), [5, 5, false, false])

// 4. one gap bridged by the freeze
check('active, MISS, active', s([d(2), d(0)]), [2, 2, true, true])
check('streak counted across a freeze', s([d(4), d(3), d(2), d(0)]), [4, 4, true, true])

// 5. two missed days in a row breaks
// d(3) and d(0) are two isolated single days: the 2 day gap breaks the run, so
// the longest is 1, not 2. Both runs are one day long.
check('two missed days breaks', s([d(3), d(0)]), [1, 1, true, false])
check('run before a 2 day gap kept as longest', s([d(9), d(8), d(7), d(6), d(0)]), [1, 4, true, false])

// 6. liveness window
check('last active 2 days ago, freeze holding', s([d(3), d(2)]), [2, 2, false, true])
check('last active 3 days ago, broken', s([d(4), d(3)]), [0, 2, false, false])

// separate one day gaps each bridge
check('two separate bridged gaps', s([d(4), d(2), d(0)]), [3, 3, true, true])

// hygiene
check('future dates ignored', s([addDays(TODAY, 3), d(0)]), [1, 1, true, false])
check('duplicates collapse', s([d(1), d(1), d(0), d(0)]), [2, 2, true, false])
check('unsorted input', s([d(0), d(2), d(1)]), [3, 3, true, false])
check('longest never below current', (() => {
  const r = computeStreak([d(2), d(1), d(0)], TODAY); return r.longestStreak >= r.currentStreak
})(), true)

// week view: a fixed Monday to Sunday week containing today.
// TODAY is 2026-07-22, a Wednesday, so the week runs Mon 20 to Sun 26 and
// Thu 23 onward are upcoming.
check('week starts on Monday',
  currentWeek([], TODAY).map(x => x.date),
  ['2026-07-20','2026-07-21','2026-07-22','2026-07-23','2026-07-24','2026-07-25','2026-07-26'])

check('week labels run Mon..Sun',
  currentWeek([], TODAY).map(x => x.weekday),
  [1, 2, 3, 4, 5, 6, 0])

check('today is marked and later days are upcoming',
  currentWeek([], TODAY).map(x => `${x.kind}${x.isToday ? '*' : ''}`),
  ['missed', 'missed', 'missed*', 'upcoming', 'upcoming', 'upcoming', 'upcoming'])

// Mon and Wed active, Tue covered by the freeze.
check('active, bridged and today inside the week',
  currentWeek([d(2), d(0)], TODAY).map(x => `${x.kind}${x.isToday ? '*' : ''}`),
  ['active', 'bridged', 'active*', 'upcoming', 'upcoming', 'upcoming', 'upcoming'])

// Yesterday held open by a live run that today has not yet renewed.
check('yesterday shown as covered before today is used',
  currentWeek([d(2)], TODAY).map(x => x.kind),
  ['active', 'bridged', 'missed', 'upcoming', 'upcoming', 'upcoming', 'upcoming'])

// A Sunday: the whole week is in the past, nothing upcoming.
check('on a Sunday the week is complete',
  currentWeek([], '2026-07-26').map(x => `${x.kind}${x.isToday ? '*' : ''}`),
  ['missed','missed','missed','missed','missed','missed','missed*'])

check('weekdayOf agrees with the calendar', [
  weekdayOf('2026-07-20'), weekdayOf('2026-07-22'), weekdayOf('2026-07-26'),
], [1, 3, 0])

// midnight safety: a date built from a local evening moment
const evening = new Date(2026, 6, 22, 23, 30)
const { localDateKey } = await import('./streak.ts')
check('local evening keeps its own day', localDateKey(evening), '2026-07-22')

console.log(failures === 0 ? '\nALL STREAK CASES PASS' : `\n${failures} FAILURE(S)`)
process.exit(failures === 0 ? 0 : 1)
