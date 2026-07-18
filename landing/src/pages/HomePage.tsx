import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation, type TranslationKey } from '../i18n'
import { Button } from '../components/Button'
import { SIGNUP_URL } from '../lib/appUrl'
import { Container } from '../components/Container'
import { Constellation } from '../components/fx/Constellation'
import { ScrollReveal } from '../components/motion/ScrollReveal'
import { Stagger, StaggerItem } from '../components/motion/Stagger'
import { usePrefersReducedMotion } from '../components/motion/useMediaQuery'
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
    <Stagger className={styles.teaserGrid}>
      {TEASERS.map(({ headingKey, lineKey, linkKey, to }) => (
        <StaggerItem key={headingKey}>
          <div className={styles.teaser}>
            <h2 className={styles.teaserHeading}>{t(headingKey)}</h2>
            <p className={styles.teaserLine}>{t(lineKey)}</p>
            <Link to={to} className={styles.teaserLink}>
              {t(linkKey)}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  )
}

/**
 * The hero keeps a faint drifting constellation behind the text, a hint of
 * the knowledge map. The fog itself is site wide (GlobalFog in the app
 * shell), so it needs nothing here. The text layer stacks above and gently
 * lifts and fades as the user scrolls past.
 */
function Hero() {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, -52])
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.977])

  const inner = (
    <div className={styles.heroInner}>
      <h1 className={styles.heroTitle}>{t('hero.title')}</h1>
      <p className={styles.heroSubtitle}>{t('hero.subtitle')}</p>
      <div className={styles.heroActions}>
        <Button href={SIGNUP_URL} variant="primary" size="lg">
          {t('hero.primary')}
        </Button>
        <Button to="/how-it-works" variant="secondary" size="lg">
          {t('hero.secondary')}
        </Button>
      </div>
    </div>
  )

  return (
    <section ref={ref} className={styles.hero}>
      <Constellation />
      <Container className={styles.heroContent}>
        {reduced ? inner : <motion.div style={{ y, opacity, scale }}>{inner}</motion.div>}
      </Container>
    </section>
  )
}

function HomePage() {
  const { t } = useTranslation()

  return (
    <>
      <Hero />

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
              <Button href={SIGNUP_URL} variant="primary" size="lg">
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
