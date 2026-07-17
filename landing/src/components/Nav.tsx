import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from '../i18n'
import { Button } from './Button'
import { Container } from './Container'
import { LanguageSwitcher } from './LanguageSwitcher'
import styles from './Nav.module.css'

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return [styles.link, isActive ? styles.linkActive : ''].filter(Boolean).join(' ')
}

export function Nav() {
  const { t } = useTranslation()

  return (
    <header className={styles.nav}>
      <Container>
        <div className={styles.inner}>
          <Link to="/" className={styles.wordmark}>
            FogMind
          </Link>

          <nav className={styles.links} aria-label="Main">
            <NavLink to="/" end className={navLinkClass}>
              {t('nav.home')}
            </NavLink>
            <NavLink to="/how-it-works" className={navLinkClass}>
              {t('nav.howItWorks')}
            </NavLink>
            <NavLink to="/product" className={navLinkClass}>
              {t('nav.product')}
            </NavLink>
          </nav>

          <div className={styles.actions}>
            <LanguageSwitcher />
            <Button to="/signup" variant="primary" size="sm">
              {t('nav.getStarted')}
            </Button>
          </div>
        </div>
      </Container>
    </header>
  )
}
