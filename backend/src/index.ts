/**
 * Public surface of the backend package.
 *
 * Apps import from '@fogmind/backend' and should not reach into subpaths, so
 * that the internal layout stays free to move.
 */

export { createSupabaseClient, type FogMindClient } from './supabaseClient'

export type {
  Json,
  DocumentSourceType,
  DocumentStatus,
  ProgressState,
  QuestionDifficulty,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  Document,
  DocumentInsert,
  DocumentUpdate,
  Node,
  NodeInsert,
  NodeUpdate,
  Edge,
  EdgeInsert,
  EdgeUpdate,
  Question,
  QuestionInsert,
  QuestionUpdate,
  Progress,
  ProgressInsert,
  ProgressUpdate,
  Database,
} from './types/database'

export {
  createDocument,
  listDocumentsForUser,
  getDocument,
  updateDocumentStatus,
  type CreateDocumentInput,
} from './queries/documents'
export { insertNodes, listNodesForDocument, countNodes } from './queries/nodes'
export { insertEdges, listEdgesForDocument, countEdges } from './queries/edges'
export {
  insertQuestions,
  listQuestionsForNode,
  countQuestionsForNodes,
} from './queries/questions'
export {
  createInitialProgressForNodes,
  listProgressForNodes,
  type InitialProgressInput,
} from './queries/progress'
