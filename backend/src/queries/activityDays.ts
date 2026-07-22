/**
 * Data access for the activity_days table: one row per user per calendar day on
 * which they answered at least one question. This is the raw material the
 * learning streak is derived from.
 *
 * Only the set of dates is stored. Nothing here counts anything, because a
 * stored counter can fall out of step with the days it claims to describe while
 * a derived one cannot.
 */
import type { FogMindClient } from '../supabaseClient'
import type { ActivityDay } from '../types/database'

/**
 * Marks a calendar day active for a user.
 *
 * Idempotent by construction: the unique (user_id, activity_date) pair makes a
 * repeat call for the same day a no op rather than a duplicate row, so callers
 * are free to invoke it on every answer without checking first.
 *
 * The date is passed in rather than derived here, because only the client knows
 * the reader's local calendar day. Deriving it in this layer would file an
 * answer given late in the evening under tomorrow for anyone east of UTC.
 */
export async function recordActivityDay(
  client: FogMindClient,
  input: { user_id: string; activity_date: string },
): Promise<ActivityDay> {
  const { data, error } = await client
    .from('activity_days')
    .upsert(
      { user_id: input.user_id, activity_date: input.activity_date },
      { onConflict: 'user_id,activity_date' },
    )
    .select()
    .single()
  if (error) throw new Error(`Could not record today's activity: ${error.message}`)
  return data
}

/**
 * Every day this user has been active, oldest first. Row level security scopes
 * this to the caller, so no user filter is needed here.
 */
export async function listActivityDates(client: FogMindClient): Promise<string[]> {
  const { data, error } = await client
    .from('activity_days')
    .select('activity_date')
    .order('activity_date', { ascending: true })
  if (error) throw new Error(`Could not load your activity: ${error.message}`)
  return data.map((row) => row.activity_date)
}
