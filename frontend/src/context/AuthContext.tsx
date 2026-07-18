import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  getSession,
  onAuthStateChange,
  signIn as signInRequest,
  signOut as signOutRequest,
  signUp as signUpRequest,
  type AuthResult,
  type Session,
  type User,
} from '../lib/auth'

interface AuthContextValue {
  session: Session | null
  user: User | null
  /** True until the initial session has resolved. */
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    getSession()
      .then((initial) => {
        if (active) setSession(initial)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    // Keeps the UI in step with sign in, sign out and token refresh, in this
    // tab and across others.
    const unsubscribe = onAuthStateChange((next) => {
      if (active) setSession(next)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn: signInRequest,
      signUp: signUpRequest,
      signOut: signOutRequest,
    }),
    [session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
