import {
  createDocument,
  createInitialProgressForNodes,
  insertEdges,
  insertNodes,
  insertQuestions,
  updateDocumentStatus,
  type Document,
  type DocumentSourceType,
  type EdgeInsert,
  type NodeInsert,
  type QuestionInsert,
} from '@fogmind/backend'
import { analyze } from './analyze'
import { supabase } from './supabase'

export interface IngestInput {
  userId: string
  title: string
  sourceType: DocumentSourceType
  text: string
}

export interface IngestResult {
  document: Document
  nodeCount: number
  edgeCount: number
  questionCount: number
}

/**
 * The persistence pipeline. Creates the document as processing, runs the
 * deterministic analysis, saves nodes, edges, questions and fogged progress
 * under the user, then marks the document ready. Any failure flips the document
 * to failed and rethrows, so the UI can report it. Every row carries user_id so
 * the inserts pass RLS.
 */
export async function ingest(input: IngestInput): Promise<IngestResult> {
  const { userId, title, sourceType, text } = input

  const document = await createDocument(supabase, {
    user_id: userId,
    title,
    source_type: sourceType,
    status: 'processing',
  })

  try {
    const graph = analyze(text)
    if (graph.nodes.length === 0) {
      // Message is a translation key; the display layer runs it through t().
      throw new Error('err.noContent')
    }

    const nodeRows: NodeInsert[] = graph.nodes.map((node) => ({
      id: node.id,
      document_id: document.id,
      user_id: userId,
      title: node.title,
      summary: node.summary,
      position_x: node.position_x,
      position_y: node.position_y,
    }))
    await insertNodes(supabase, nodeRows)

    const edgeRows: EdgeInsert[] = graph.edges.map((edge) => ({
      document_id: document.id,
      user_id: userId,
      source_node_id: edge.source_node_id,
      target_node_id: edge.target_node_id,
    }))
    await insertEdges(supabase, edgeRows)

    const questionRows: QuestionInsert[] = graph.questions.map((question) => ({
      node_id: question.node_id,
      user_id: userId,
      prompt: question.prompt,
      correct_answer: question.correct_answer,
      options: question.options,
      difficulty: question.difficulty,
    }))
    await insertQuestions(supabase, questionRows)

    await createInitialProgressForNodes(
      supabase,
      graph.nodes.map((node) => ({ user_id: userId, node_id: node.id })),
    )

    await updateDocumentStatus(supabase, document.id, 'ready')

    return {
      document: { ...document, status: 'ready' },
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      questionCount: graph.questions.length,
    }
  } catch (err) {
    // Best effort: record the failure so the list reflects it. Swallow a
    // secondary error here so the original cause is what surfaces.
    await updateDocumentStatus(supabase, document.id, 'failed').catch(() => {})
    throw err
  }
}
