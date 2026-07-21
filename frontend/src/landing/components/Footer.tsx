import { Link } from 'react-router-dom'
import { useTranslation, type TranslationKey } from '../../i18n'
import { Container } from './Container'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'
import styles from './Footer.module.css'

/*
 * The footer carries the full sitemap for all seven pages, split into the
 * journey through the product and everything else. The top bar deliberately
 * shows only the first group.
 */
interface ColumnSpec {
  titleKey: TranslationKey
  links: readonly { to: string; labelKey: TranslationKey }[]
}

const COLUMNS: readonly ColumnSpec[] = [
  {
    titleKey: 'footer.colExplore',
    links: [
      { to: '/', labelKey: 'footer.home' },
      { to: '/how-it-works', labelKey: 'footer.howItWorks' },
      { to: '/product', labelKey: 'footer.product' },
    ],
  },
  {
    titleKey: 'footer.colMore',
    links: [
      { to: '/who-its-for', labelKey: 'nav.who' },
      { to: '/why-it-works', labelKey: 'nav.why' },
      { to: '/about', labelKey: 'nav.about' },
      { to: '/faq', labelKey: 'nav.faq' },
    ],
  },
]

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className={styles.footer}>
      <Container>
        {/* The footer sits in the dense bottom edge, so carve the row clear. */}
        <div className={styles.inner} data-fog-clear>
          <div className={styles.brand}>
            <Link to="/" className={styles.wordmark}>
              FogMind
            </Link>
            <span className={styles.tagline}>{t('footer.tagline')}</span>
            <LanguageSwitcher />
          </div>

          <nav className={styles.sitemap} aria-label="Footer">
            {COLUMNS.map(({ titleKey, links }) => (
              <div key={titleKey} className={styles.column}>
                <span className={styles.columnTitle}>{t(titleKey)}</span>
                {links.map(({ to, labelKey }) => (
                  <Link key={to} to={to} className={styles.link}>
                    {t(labelKey)}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  )
}
