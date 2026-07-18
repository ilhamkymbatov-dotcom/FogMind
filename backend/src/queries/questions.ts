/**
 * Data access for the questions table. Questions hang off nodes, so counts and
 * lookups are keyed by node id rather than document id.
 */
import type { FogMindClient } from '../supabaseClient'
import type { Question, QuestionInsert } from '../types/database'

export async function insertQuestions(
  client: FogMindClient,
  rows: QuestionInsert[],
): Promise<Question[]> {
  if (rows.length === 0) return []
  const { data, error } = await client.from('questions').insert(rows).select()
  if (error) throw new Error(`Could not save questions: ${error.message}`)
  return data
}

export async function listQuestionsForNode(
  client: FogMindClient,
  nodeId: string,
): Promise<Question[]> {
  const { data, error } = await client
    .from('questions')
    .select('*')
    .eq('node_id', nodeId)
    .order('difficulty', { ascending: true })
  if (error) throw new Error(`Could not load questions: ${error.message}`)
  return data
}

export async function countQuestionsForNodes(
  client: FogMindClient,
  nodeIds: string[],
): Promise<number> {
  if (nodeIds.length === 0) return 0
  const { count, error } = await client
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .in('node_id', nodeIds)
  if (error) throw new Error(`Could not count questions: ${error.message}`)
  return count ?? 0
}
