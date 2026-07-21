import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../i18n'
import styles from './RouteGuards.module.css'

function Resolving() {
  const { t } = useTranslation()
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.srOnly}>{t('common.loading')}</span>
    </div>
  )
}

/** Gates the signed in area: waits for the session, then redirects out if none. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) return <Resolving />
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

/** Login and signup: an already authenticated visitor is sent to the app. */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) return <Resolving />
  if (session) return <Navigate to="/app" replace />
  return <>{children}</>
}
