import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types/database'

/** A Supabase client that knows the FogMind schema. */
export type FogMindClient = SupabaseClient<Database>

function requireEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export function createSupabaseClient(): FogMindClient {
  return createClient<Database>(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_ANON_KEY'))
}

export const supabase: FogMindClient = createSupabaseClient()
