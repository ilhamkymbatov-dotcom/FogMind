/**
 * Data access for the question_answers table: one row per user per question,
 * recording whether it was answered correctly. Drives node completion, mastery
 * and the review round across reloads.
 */
import type { FogMindClient } from '../supabaseClient'
import type { QuestionAnswer } from '../types/database'

/**
 * Records the outcome of answering a question, upserting on the unique
 * (user_id, question_id) pair so a review round can flip a wrong answer to
 * correct without creating a duplicate.
 */
export async function upsertQuestionAnswer(
  client: FogMindClient,
  input: { user_id: string; question_id: string; is_correct: boolean },
): Promise<QuestionAnswer> {
  const { data, error } = await client
    .from('question_answers')
    .upsert(
      { user_id: input.user_id, question_id: input.question_id, is_correct: input.is_correct, answered_at: new Date().toISOString() },
      { onConflict: 'user_id,question_id' },
    )
    .select()
    .single()
  if (error) throw new Error(`Could not save your answer: ${error.message}`)
  return data
}

export async function listAnswersForQuestions(
  client: FogMindClient,
  questionIds: string[],
): Promise<QuestionAnswer[]> {
  if (questionIds.length === 0) return []
  const { data, error } = await client
    .from('question_answers')
    .select('*')
    .in('question_id', questionIds)
  if (error) throw new Error(`Could not load your answers: ${error.message}`)
  return data
}
