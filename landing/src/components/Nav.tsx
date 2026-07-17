import { useEffect, useId, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useTranslation } from '../i18n'
import { Button } from './Button'
import { Container } from './Container'
import { LanguageSwitcher } from './LanguageSwitcher'
import styles from './Nav.module.css'

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return [styles.link, isActive ? styles.linkActive : ''].filter(Boolean).join(' ')
}

function panelLinkClass({ isActive }: { isActive: boolean }): string {
  return [styles.panelLink, isActive ? styles.panelLinkActive : ''].filter(Boolean).join(' ')
}

export function Nav() {
  const { t } = useTranslation()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const panelId = useId()

  // Close the menu after navigating, so a link tap does not leave it open over
  // the new page.
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Escape closes the menu, matching the expectation for any dismissible panel.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

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

          <button
            type="button"
            className={styles.menuButton}
            aria-label={t('nav.menu')}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </Container>

      {open ? (
        <div className={styles.panel} id={panelId}>
          <Container>
            <nav className={styles.panelInner} aria-label="Mobile">
              <NavLink to="/" end className={panelLinkClass}>
                {t('nav.home')}
              </NavLink>
              <NavLink to="/how-it-works" className={panelLinkClass}>
                {t('nav.howItWorks')}
              </NavLink>
              <NavLink to="/product" className={panelLinkClass}>
                {t('nav.product')}
              </NavLink>

              <div className={styles.panelDivider} />

              <div className={styles.panelActions}>
                <LanguageSwitcher />
                <Button to="/signup" variant="primary" size="lg">
                  {t('nav.getStarted')}
                </Button>
              </div>
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  )
}
