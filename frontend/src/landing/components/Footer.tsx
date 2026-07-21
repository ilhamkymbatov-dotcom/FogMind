import { Link } from 'react-router-dom'
import { useTranslation } from '../../i18n'
import { Container } from './Container'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'
import styles from './Footer.module.css'

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
          </div>

          <nav className={styles.links} aria-label="Footer">
            <Link to="/" className={styles.link}>
              {t('footer.home')}
            </Link>
            <Link to="/how-it-works" className={styles.link}>
              {t('footer.howItWorks')}
            </Link>
            <Link to="/product" className={styles.link}>
              {t('footer.product')}
            </Link>
          </nav>

          <LanguageSwitcher />
        </div>
      </Container>
    </footer>
  )
}
