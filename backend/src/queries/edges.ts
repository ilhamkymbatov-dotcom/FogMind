/**
 * Data access for the edges table.
 */
import type { FogMindClient } from '../supabaseClient'
import type { Edge, EdgeInsert } from '../types/database'

export async function insertEdges(client: FogMindClient, rows: EdgeInsert[]): Promise<Edge[]> {
  if (rows.length === 0) return []
  const { data, error } = await client.from('edges').insert(rows).select()
  if (error) throw new Error(`Could not save edges: ${error.message}`)
  return data
}

export async function listEdgesForDocument(
  client: FogMindClient,
  documentId: string,
): Promise<Edge[]> {
  const { data, error } = await client.from('edges').select('*').eq('document_id', documentId)
  if (error) throw new Error(`Could not load edges: ${error.message}`)
  return data
}

export async function countEdges(client: FogMindClient, documentId: string): Promise<number> {
  const { count, error } = await client
    .from('edges')
    .select('id', { count: 'exact', head: true })
    .eq('document_id', documentId)
  if (error) throw new Error(`Could not count edges: ${error.message}`)
  return count ?? 0
}
