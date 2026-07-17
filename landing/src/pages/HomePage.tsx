import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation, type TranslationKey } from '../i18n'
import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { ScrollReveal } from '../components/motion/ScrollReveal'
import styles from './HomePage.module.css'

interface TeaserSpec {
  headingKey: TranslationKey
  lineKey: TranslationKey
  linkKey: TranslationKey
  to: string
}

/**
 * Home stays high level. Rather than repeat the How it works and Product copy,
 * each teaser gives one line and a link into the page that owns the detail.
 */
const TEASERS: readonly TeaserSpec[] = [
  { headingKey: 'home.hiw.heading', lineKey: 'home.hiw.line', linkKey: 'home.hiw.link', to: '/how-it-works' },
  {
    headingKey: 'home.product.heading',
    lineKey: 'home.product.line',
    linkKey: 'home.product.link',
    to: '/product',
  },
]

function Teasers() {
  const { t } = useTranslation()

  return (
    <div className={styles.teaserGrid}>
      {TEASERS.map(({ headingKey, lineKey, linkKey, to }, index) => (
        <ScrollReveal key={headingKey} delay={index * 0.08}>
          <div className={styles.teaser}>
            <h2 className={styles.teaserHeading}>{t(headingKey)}</h2>
            <p className={styles.teaserLine}>{t(lineKey)}</p>
            <Link to={to} className={styles.teaserLink}>
              {t(linkKey)}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </ScrollReveal>
      ))}
    </div>
  )
}

function HomePage() {
  const { t } = useTranslation()

  return (
    <>
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>{t('hero.title')}</h1>
            <p className={styles.heroSubtitle}>{t('hero.subtitle')}</p>
            <div className={styles.heroActions}>
              <Button to="/signup" variant="primary" size="lg">
                {t('hero.primary')}
              </Button>
              <Button to="/how-it-works" variant="secondary" size="lg">
                {t('hero.secondary')}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <Teasers />
        </Container>
      </section>

      <section className={styles.cta}>
        <Container>
          <ScrollReveal>
            <div className={styles.ctaInner}>
              <h2 className={styles.ctaTitle}>{t('cta.title')}</h2>
              <Button to="/signup" variant="primary" size="lg">
                {t('cta.button')}
              </Button>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </>
  )
}

export default HomePage
