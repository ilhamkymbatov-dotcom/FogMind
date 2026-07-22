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

/** What a reset actually touched, so the caller can report or verify it. */
export interface ResetProgressResult {
  nodesReset: number
  answersCleared: number
}

/**
 * Returns every node of a document to the fog.
 *
 * Progress rows go back to their initial shape and the recorded answers for the
 * document's questions are removed, which is what actually re opens the map:
 * node status is derived from the answers, so clearing them leaves nothing
 * completed, nothing mastered, and only the starting node reachable.
 *
 * The document, its nodes, edges and questions are untouched, and so is the
 * activity history the streak is built from. Studying is being reset, not
 * erased.
 *
 * Safe to run twice: every step is a set to a fixed value or a delete, so a
 * retry after a partial failure lands in the same place.
 */
export async function resetProgressForDocument(
  client: FogMindClient,
  documentId: string,
): Promise<ResetProgressResult> {
  const { data: nodeRows, error: nodeError } = await client
    .from('nodes')
    .select('id')
    .eq('document_id', documentId)
  if (nodeError) throw new Error(`Could not load this map: ${nodeError.message}`)

  const nodeIds = nodeRows.map((row) => row.id)
  if (nodeIds.length === 0) return { nodesReset: 0, answersCleared: 0 }

  const { data: questionRows, error: questionError } = await client
    .from('questions')
    .select('id')
    .in('node_id', nodeIds)
  if (questionError) throw new Error(`Could not load this map: ${questionError.message}`)

  const { data: resetRows, error: resetError } = await client
    .from('progress')
    .update({
      state: 'fogged',
      correct_count: 0,
      attempt_count: 0,
      last_reviewed_at: null,
    })
    .in('node_id', nodeIds)
    .select('id')
  if (resetError) throw new Error(`Could not reset this map: ${resetError.message}`)

  const questionIds = questionRows.map((row) => row.id)
  let answersCleared = 0
  if (questionIds.length > 0) {
    const { data: clearedRows, error: clearError } = await client
      .from('question_answers')
      .delete()
      .in('question_id', questionIds)
      .select('id')
    if (clearError) throw new Error(`Could not reset this map: ${clearError.message}`)
    answersCleared = clearedRows.length
  }

  return { nodesReset: resetRows.length, answersCleared }
}
