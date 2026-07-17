import { createSupabaseClient } from '@fogmind/backend'

/**
 * The app's single Supabase client.
 *
 * Vite inlines import.meta.env at build time, so a missing variable surfaces as
 * undefined here rather than as a network error later. Failing loudly on import
 * is deliberate: a client built from a blank URL produces confusing 404s far
 * from the actual cause.
 *
 * Copy .env.example to .env.local and fill both values in.
 */
function readEnv(name: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'): string {
  const value = import.meta.env[name]

  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.example to .env.local and fill it in.`)
  }

  return value
}

export const supabase = createSupabaseClient(
  readEnv('VITE_SUPABASE_URL'),
  readEnv('VITE_SUPABASE_ANON_KEY'),
)
