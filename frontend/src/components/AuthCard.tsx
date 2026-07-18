import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './AuthCard.module.css'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  /** The prompt and link shown under the card, e.g. switch to sign in. */
  footer?: ReactNode
}

/** Centered sharp cornered card shared by the sign up and login screens. */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.wordmark}>
          FogMind
        </Link>
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        {children}
        {footer ? <p className={styles.footer}>{footer}</p> : null}
      </div>
    </div>
  )
}

export { styles as authStyles }
