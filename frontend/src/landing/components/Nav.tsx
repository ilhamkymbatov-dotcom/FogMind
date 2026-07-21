import { useEffect, useId, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useTranslation, type TranslationKey } from '../../i18n'
import { Button } from './Button'
import { Container } from './Container'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'
import styles from './Nav.module.css'

/** The primary journey, shown in the top bar and first in the mobile panel. */
const PRIMARY = [
  { to: '/how-it-works', labelKey: 'nav.howItWorks' },
  { to: '/product', labelKey: 'nav.product' },
  { to: '/who-its-for', labelKey: 'nav.who' },
  { to: '/why-it-works', labelKey: 'nav.why' },
] as const satisfies readonly { to: string; labelKey: TranslationKey }[]

/** The rest of the sitemap: footer on wide screens, mobile panel on narrow. */
const SECONDARY = [
  { to: '/about', labelKey: 'nav.about' },
  { to: '/faq', labelKey: 'nav.faq' },
] as const satisfies readonly { to: string; labelKey: TranslationKey }[]

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
        {/* The bar sits in the dense top edge, so carve the whole row clear. */}
        <div className={styles.inner} data-fog-clear>
          <Link to="/" className={styles.wordmark}>
            FogMind
          </Link>

          {/* The primary journey only. About and the questions live in the
              footer sitemap, so the bar stays readable at seven pages. */}
          <nav className={styles.links} aria-label="Main">
            {PRIMARY.map(({ to, labelKey }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                {t(labelKey)}
              </NavLink>
            ))}
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
            data-fog-clear
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </Container>

      {open ? (
        <div className={styles.panel} id={panelId}>
          <Container>
            {/* The panel carries the whole sitemap, since there is no footer in
                view while it is open. */}
            <nav className={styles.panelInner} aria-label="Mobile" data-fog-clear>
              <NavLink to="/" end className={panelLinkClass}>
                {t('nav.home')}
              </NavLink>
              {PRIMARY.map(({ to, labelKey }) => (
                <NavLink key={to} to={to} className={panelLinkClass}>
                  {t(labelKey)}
                </NavLink>
              ))}

              <div className={styles.panelDivider} />

              {SECONDARY.map(({ to, labelKey }) => (
                <NavLink key={to} to={to} className={panelLinkClass}>
                  {t(labelKey)}
                </NavLink>
              ))}

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
