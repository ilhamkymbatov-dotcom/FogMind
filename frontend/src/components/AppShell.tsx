import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../i18n'
import { Button } from './Button'
import { LanguageSwitcher } from './LanguageSwitcher'
import styles from './AppShell.module.css'

/** The signed in chrome: a top bar with the wordmark, the user's email and
 *  a sign out action, wrapping the protected pages through an Outlet. */
export function AppShell() {
  const { user, signOut } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      // If sign out fails the session stays; let the user try again.
      setSigningOut(false)
    }
  }

  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <Link to="/" className={styles.wordmark} aria-label={t('shell.home')}>
          FogMind
        </Link>
        <div className={styles.right}>
          {user?.email ? <span className={styles.email}>{user.email}</span> : null}
          <LanguageSwitcher />
          <Button
            variant="secondary"
            size="sm"
            icon={LogOut}
            className={styles.signOut}
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? t('shell.signingOut') : t('shell.signOut')}
          </Button>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
