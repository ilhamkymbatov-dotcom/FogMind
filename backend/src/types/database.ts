/**
 * Hand written mirror of migrations/001_initial_schema.sql.
 *
 * These types are the contract between the database and both apps, so they must
 * be kept in step with the migration by hand. Once the project is linked with
 * the Supabase CLI, `supabase gen types typescript --linked` can generate this
 * file instead and remove the drift risk.
 */

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

/** Mirrors the check constraint on documents.source_type. */
export type DocumentSourceType = 'pdf' | 'docx' | 'markdown' | 'text'

/** Mirrors the check constraint on documents.status. */
export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'failed'

/** Mirrors the check constraint on progress.state. */
export type ProgressState = 'fogged' | 'revealed' | 'mastered'

/** Mirrors the check constraint on questions.difficulty: 1 easy, 2 medium, 3 hard. */
export type QuestionDifficulty = 1 | 2 | 3

/**
 * Makes the listed columns optional.
 *
 * A column may be omitted on insert when Postgres can supply the value itself,
 * which covers two cases: it has a default, or it is nullable. Note that a
 * nullable column shows up above as `T | null`, which is a required property
 * holding a nullable value, so it still has to be listed here to be omittable.
 */
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

export type Profile = {
  id: string
  email: string | null
  display_name: string | null
  created_at: string
}

export type Document = {
  id: string
  user_id: string
  title: string
  source_type: DocumentSourceType
  status: DocumentStatus
  created_at: string
}

/**
 * A knowledge graph node.
 *
 * Note the name collides with the DOM's built in Node when imported into the
 * apps. Import it explicitly rather than relying on the global.
 */
export type Node = {
  id: string
  document_id: string
  user_id: string
  title: string
  summary: string | null
  position_x: number
  position_y: number
  created_at: string
}

export type Edge = {
  id: string
  document_id: string
  user_id: string
  source_node_id: string
  target_node_id: string
  created_at: string
}

export type Question = {
  id: string
  node_id: string
  user_id: string
  prompt: string
  correct_answer: string
  /** Answer choices for multiple choice questions. Null for open answer. */
  options: Json[] | null
  difficulty: QuestionDifficulty
  created_at: string
}

export type Progress = {
  id: string
  user_id: string
  node_id: string
  state: ProgressState
  correct_count: number
  attempt_count: number
  last_reviewed_at: string | null
  created_at: string
}

/** One row per user per question, the outcome of answering it. */
export type QuestionAnswer = {
  id: string
  user_id: string
  question_id: string
  is_correct: boolean
  answered_at: string
}

// ---------------------------------------------------------------------------
// Insert and update shapes
// ---------------------------------------------------------------------------

// profiles.id is not generated: it must be an existing auth.users id.
export type ProfileInsert = Optional<Profile, 'email' | 'display_name' | 'created_at'>
export type ProfileUpdate = Partial<Profile>

export type DocumentInsert = Optional<Document, 'id' | 'status' | 'created_at'>
export type DocumentUpdate = Partial<Document>

export type NodeInsert = Optional<
  Node,
  'id' | 'summary' | 'position_x' | 'position_y' | 'created_at'
>
export type NodeUpdate = Partial<Node>

export type EdgeInsert = Optional<Edge, 'id' | 'created_at'>
export type EdgeUpdate = Partial<Edge>

export type QuestionInsert = Optional<Question, 'id' | 'options' | 'difficulty' | 'created_at'>
export type QuestionUpdate = Partial<Question>

export type ProgressInsert = Optional<
  Progress,
  'id' | 'state' | 'correct_count' | 'attempt_count' | 'last_reviewed_at' | 'created_at'
>
export type ProgressUpdate = Partial<Progress>

export type QuestionAnswerInsert = Optional<QuestionAnswer, 'id' | 'answered_at'>
export type QuestionAnswerUpdate = Partial<QuestionAnswer>

// ---------------------------------------------------------------------------
// Schema shape consumed by createClient
// ---------------------------------------------------------------------------

/**
 * The schema shape supabase-js expects from its Database generic.
 *
 * Two details here are load bearing and fail silently if you get them wrong.
 * The row types above must be type aliases rather than interfaces, because
 * supabase-js constrains every Row to Record<string, unknown> and only aliases
 * pick up an implicit index signature. Every table must also carry a
 * Relationships array, even an empty one. Miss either and this type stops
 * satisfying GenericSchema, at which point supabase-js resolves the schema to
 * never instead of raising an error: from() then accepts any table name and
 * every query returns null. Run the checks in __typetest.ts if you touch this.
 *
 * Relationships stays empty because nothing here joins through PostgREST's
 * embedded resource syntax yet. Populate it when that changes.
 */
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: ProfileInsert; Update: ProfileUpdate; Relationships: [] }
      documents: { Row: Document; Insert: DocumentInsert; Update: DocumentUpdate; Relationships: [] }
      nodes: { Row: Node; Insert: NodeInsert; Update: NodeUpdate; Relationships: [] }
      edges: { Row: Edge; Insert: EdgeInsert; Update: EdgeUpdate; Relationships: [] }
      questions: { Row: Question; Insert: QuestionInsert; Update: QuestionUpdate; Relationships: [] }
      progress: { Row: Progress; Insert: ProgressInsert; Update: ProgressUpdate; Relationships: [] }
      question_answers: {
        Row: QuestionAnswer
        Insert: QuestionAnswerInsert
        Update: QuestionAnswerUpdate
        Relationships: []
      }
    }
    // These must be written as `{ [_ in never]: never }` rather than
    // `Record<string, never>`. from() has a view overload keyed on
    // keyof Schema['Views'], and keyof Record<string, never> is string, which
    // would make from() accept any name at all. keyof { [_ in never]: never }
    // is never, which closes it. This is the idiom the Supabase type generator
    // emits for empty sections.
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
