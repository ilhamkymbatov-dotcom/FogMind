/**
 * Data access for the nodes table. Bulk insert accepts rows that already carry
 * their id, so edges and questions can reference nodes before the round trip.
 */
import type { FogMindClient } from '../supabaseClient'
import type { Node, NodeInsert } from '../types/database'

export async function insertNodes(client: FogMindClient, rows: NodeInsert[]): Promise<Node[]> {
  if (rows.length === 0) return []
  const { data, error } = await client.from('nodes').insert(rows).select()
  if (error) throw new Error(`Could not save nodes: ${error.message}`)
  return data
}

export async function listNodesForDocument(
  client: FogMindClient,
  documentId: string,
): Promise<Node[]> {
  const { data, error } = await client
    .from('nodes')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(`Could not load nodes: ${error.message}`)
  return data
}

export async function countNodes(client: FogMindClient, documentId: string): Promise<number> {
  const { count, error } = await client
    .from('nodes')
    .select('id', { count: 'exact', head: true })
    .eq('document_id', documentId)
  if (error) throw new Error(`Could not count nodes: ${error.message}`)
  return count ?? 0
}
