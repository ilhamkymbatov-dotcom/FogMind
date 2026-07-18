/**
 * Data access for the progress table: one row per user per node, unique on
 * (user_id, node_id).
 */
import type { FogMindClient } from '../supabaseClient'
import type { Progress, ProgressInsert, ProgressUpdate } from '../types/database'

export interface InitialProgressInput {
  user_id: string
  node_id: string
}

/**
 * Seeds a fogged progress row for each freshly created node. State, counts and
 * timestamps fall back to their column defaults.
 */
export async function createInitialProgressForNodes(
  client: FogMindClient,
  entries: InitialProgressInput[],
): Promise<Progress[]> {
  if (entries.length === 0) return []
  const rows: ProgressInsert[] = entries.map((entry) => ({
    user_id: entry.user_id,
    node_id: entry.node_id,
    state: 'fogged',
  }))
  const { data, error } = await client.from('progress').insert(rows).select()
  if (error) throw new Error(`Could not save progress: ${error.message}`)
  return data
}

export async function listProgressForNodes(
  client: FogMindClient,
  nodeIds: string[],
): Promise<Progress[]> {
  if (nodeIds.length === 0) return []
  const { data, error } = await client.from('progress').select('*').in('node_id', nodeIds)
  if (error) throw new Error(`Could not load progress: ${error.message}`)
  return data
}

/** Persists a change to a progress row (state, counts, last reviewed). */
export async function updateProgress(
  client: FogMindClient,
  id: string,
  patch: ProgressUpdate,
): Promise<Progress> {
  const { data, error } = await client
    .from('progress')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`Could not save progress: ${error.message}`)
  return data
}
