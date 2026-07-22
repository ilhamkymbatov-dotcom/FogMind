/**
 * Data access for the documents table. All reads and writes run through RLS, so
 * they only ever touch the signed in user's rows.
 */
import type { FogMindClient } from '../supabaseClient'
import type { Document, DocumentSourceType, DocumentStatus } from '../types/database'

export interface CreateDocumentInput {
  user_id: string
  title: string
  source_type: DocumentSourceType
  status?: DocumentStatus
}

export async function createDocument(
  client: FogMindClient,
  input: CreateDocumentInput,
): Promise<Document> {
  const { data, error } = await client.from('documents').insert(input).select().single()
  if (error) throw new Error(`Could not create document: ${error.message}`)
  return data
}

export async function listDocumentsForUser(
  client: FogMindClient,
  userId: string,
): Promise<Document[]> {
  const { data, error } = await client
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Could not load documents: ${error.message}`)
  return data
}

export async function getDocument(
  client: FogMindClient,
  id: string,
): Promise<Document | null> {
  const { data, error } = await client.from('documents').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Could not load document: ${error.message}`)
  return data
}

export async function updateDocumentStatus(
  client: FogMindClient,
  id: string,
  status: DocumentStatus,
): Promise<void> {
  const { error } = await client.from('documents').update({ status }).eq('id', id)
  if (error) throw new Error(`Could not update document status: ${error.message}`)
}

/**
 * Deletes a document and everything derived from it.
 *
 * One statement is enough. The schema cascades all the way down: nodes hang off
 * documents, and questions, progress and edges hang off nodes, with
 * question_answers hanging off questions. Postgres runs those cascades itself,
 * so there is nothing left to sweep up and no window in which a half deleted
 * map could be observed.
 *
 * Row level security scopes the delete to the owner, so a document belonging to
 * someone else simply matches nothing rather than being removed.
 */
export async function deleteDocument(client: FogMindClient, documentId: string): Promise<void> {
  const { error } = await client.from('documents').delete().eq('id', documentId)
  if (error) throw new Error(`Could not delete this map: ${error.message}`)
}
