import type { AuthError, Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type { Session, User }

export interface AuthResult {
  user: User | null
  session: Session | null
}

/**
 * Turns a Supabase auth error into a calm, human message. Supabase messages are
 * terse and sometimes technical, so the common cases are mapped explicitly and
 * anything unmapped falls back to the original text.
 */
function messageFor(error: AuthError): string {
  const raw = error.message.toLowerCase()

  // Returns a translation key; the display layer runs it through t(). An
  // unmapped case yields the generic key rather than a raw English string.
  if (raw.includes('invalid login credentials')) return 'auth.err.invalidCredentials'
  if (raw.includes('email not confirmed')) return 'auth.err.emailNotConfirmed'
  if (raw.includes('already registered') || raw.includes('already been registered'))
    return 'auth.err.alreadyRegistered'
  if (raw.includes('password should be at least')) return 'auth.err.passwordTooShort'
  if (raw.includes('unable to validate email') || raw.includes('invalid email'))
    return 'auth.err.invalidEmail'
  if (raw.includes('rate limit') || raw.includes('too many')) return 'auth.err.rateLimited'
  return 'common.somethingWrong'
}

/**
 * Creates an account. With email confirmation enabled Supabase returns a user
 * but no session; the caller should treat a null session as "confirmation
 * pending" rather than a completed login. The confirmation link returns the
 * user to /login.
 */
export async function signUp(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthResult> {
  const trimmedName = displayName?.trim()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
      data: trimmedName ? { display_name: trimmedName } : undefined,
    },
  })

  if (error) {
    throw new Error(messageFor(error))
  }

  return { user: data.user, session: data.session }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    throw new Error(messageFor(error))
  }

  return { user: data.user, session: data.session }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(messageFor(error))
  }
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

/** Subscribes to auth changes. Returns an unsubscribe function. */
export function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
  return () => data.subscription.unsubscribe()
}
