/**
 * Compile time guard for the Database type in types/database.ts.
 *
 * This file has no runtime role. It exists because a malformed Database type
 * does not make supabase-js complain: the schema silently resolves to never,
 * from() starts accepting any table name, and every query result becomes null.
 * That failure looks exactly like working code until you run it. The assertions
 * below fail loudly at typecheck instead.
 *
 * If `npm run typecheck` fails in this file, suspect the Database type rather
 * than the calls below.
 */

import { supabase } from './supabaseClient'
import type { Document, Progress } from './types/database'

type Equals<A, B> =
  (<G>() => G extends A ? 1 : 2) extends <G>() => G extends B ? 1 : 2 ? true : false

type Expect<T extends true> = T

async function selectDocument() {
  const { data } = await supabase.from('documents').select('*').single()
  return data
}

async function selectProgress() {
  const { data } = await supabase.from('progress').select('*').single()
  return data
}

/**
 * A selected row must come back as exactly the row type. If the schema degrades
 * to never these collapse to null and the assertion fails.
 */
export type DocumentRowIsTyped = Expect<
  Equals<Awaited<ReturnType<typeof selectDocument>>, Document | null>
>

export type ProgressRowIsTyped = Expect<
  Equals<Awaited<ReturnType<typeof selectProgress>>, Progress | null>
>

/** Columns with database side defaults must be omittable on insert. */
export async function insertWithDefaultsOmitted() {
  await supabase.from('documents').insert({ user_id: 'u', title: 't', source_type: 'pdf' })
  await supabase.from('nodes').insert({ document_id: 'd', user_id: 'u', title: 't' })
  await supabase.from('progress').insert({ user_id: 'u', node_id: 'n' })
}

/** Constrained columns must accept every value their check constraint allows. */
export async function acceptsAllowedValues() {
  await supabase.from('documents').update({ status: 'ready' }).eq('id', 'x')
  await supabase.from('progress').update({ state: 'mastered' }).eq('id', 'x')
  await supabase.from('questions').update({ difficulty: 3 }).eq('id', 'x')
}
