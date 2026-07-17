import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types/database'

/** A Supabase client that knows the FogMind schema. */
export type FogMindClient = SupabaseClient<Database>

/**
 * Builds a client for the FogMind schema.
 *
 * Credentials are passed in rather than read from the environment on purpose.
 * This package runs in the browser through Vite, where process.env does not
 * exist, and in Node, where import.meta.env does not. Taking the values as
 * arguments keeps the package indifferent to both, and lets tests hand in a
 * stub without touching global state.
 *
 * Each app reads its own VITE_ prefixed variables and calls this once. See
 * frontend/src/lib/supabase.ts.
 */
export function createSupabaseClient(supabaseUrl: string, supabaseAnonKey: string): FogMindClient {
  if (!supabaseUrl) {
    throw new Error('createSupabaseClient: supabaseUrl is empty')
  }

  if (!supabaseAnonKey) {
    throw new Error('createSupabaseClient: supabaseAnonKey is empty')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}
