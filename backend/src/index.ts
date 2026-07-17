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
