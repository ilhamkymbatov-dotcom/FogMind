import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, MessageCircleQuestion, TrendingUp, Waypoints } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation, type TranslationKey } from '../../i18n'
import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { Eyebrow } from '../components/Eyebrow'
import { Constellation } from '../components/fx/Constellation'
import { MiniGraphDemo } from '../components/demos/MiniGraphDemo'
import { MiniProgressDemo } from '../components/demos/MiniProgressDemo'
import { MiniQuestionDemo } from '../components/demos/MiniQuestionDemo'
import { ScrollReveal } from '../components/motion/ScrollReveal'
import { Stagger, StaggerItem } from '../components/motion/Stagger'
import { usePointerTilt } from '../components/usePointerTilt'
import { usePrefersReducedMotion } from '../components/motion/useMediaQuery'
import styles from './HomePage.module.css'

/**
 * The hero. Three layers at different depths: a soft wash and the drifting
 * constellation behind, the copy in the mid ground, and the live map demo in
 * front. Scrolling separates them, and the pointer tilts the whole scene, so
 * the opening reads as space rather than a flat banner.
 */
function Hero() {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const tilt = usePointerTilt({ max: 4.5, shift: 14 })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const backdropY = useTransform(scrollYProgress, [0, 1], [0, 70])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -40])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0])

  const inner = (
    <div ref={tilt} className={styles.heroScene}>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy} data-tilt-depth="0.35">
          <Eyebrow labelKey="hero.eyebrow" />
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

        <div className={styles.heroVisual} data-tilt-depth="1">
          <div className={styles.heroCard}>
            <MiniGraphDemo />
          </div>
          <p className={styles.heroCaption}>{t('hero.demoCaption')}</p>
        </div>
      </div>
    </div>
  )

  return (
    <section ref={ref} className={styles.hero}>
      {reduced ? (
        <div className={styles.heroBackdrop} aria-hidden="true">
          <span className={styles.washWarm} />
          <span className={styles.washCool} />
          <Constellation />
        </div>
      ) : (
        <motion.div className={styles.heroBackdrop} style={{ y: backdropY }} aria-hidden="true">
          <span className={styles.washWarm} />
          <span className={styles.washCool} />
          <Constellation />
        </motion.div>
      )}

      <Container className={styles.heroContent}>
        {reduced ? inner : <motion.div style={{ y: contentY, opacity: contentOpacity }}>{inner}</motion.div>}
      </Container>
    </section>
  )
}

/** Three reasons, as a row of cards rather than another wall of text. */
interface ReasonSpec {
  icon: typeof Waypoints
  titleKey: TranslationKey
  bodyKey: TranslationKey
}

const REASONS: readonly ReasonSpec[] = [
  { icon: Waypoints, titleKey: 'home.card1.title', bodyKey: 'home.card1.body' },
  { icon: MessageCircleQuestion, titleKey: 'home.card2.title', bodyKey: 'home.card2.body' },
  { icon: TrendingUp, titleKey: 'home.card3.title', bodyKey: 'home.card3.body' },
]

function Reasons() {
  const { t } = useTranslation()

  return (
    <section className={styles.reasons}>
      <Container>
        <ScrollReveal>
          <div className={styles.sectionHead}>
            <Eyebrow labelKey="home.cards.eyebrow" />
            <h2 className={styles.sectionTitle}>{t('home.cards.title')}</h2>
          </div>
        </ScrollReveal>

        <Stagger className={styles.reasonGrid}>
          {REASONS.map(({ icon: Icon, titleKey, bodyKey }) => (
            <StaggerItem key={titleKey}>
              <article className={styles.reasonCard}>
                <span className={styles.reasonIcon}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3 className={styles.reasonTitle}>{t(titleKey)}</h3>
                <p className={styles.reasonBody}>{t(bodyKey)}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  )
}

/** Asymmetric: the question demo sits slightly low and wide of the copy. */
function AnswerSection() {
  const { t } = useTranslation()

  return (
    <section className={styles.answer}>
      <Container>
        <div className={styles.answerGrid}>
          <ScrollReveal>
            <div className={styles.answerCopy}>
              <Eyebrow labelKey="home.answer.eyebrow" />
              <h2 className={styles.sectionTitle}>{t('home.answer.title')}</h2>
              <p className={styles.prose}>{t('home.answer.body')}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <div className={styles.answerVisual}>
              <MiniQuestionDemo />
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  )
}

/** Full width warm band, so the rhythm breaks out of the two column grid. */
function ProgressBand() {
  const { t } = useTranslation()

  return (
    <section className={styles.band}>
      <Container>
        <div className={styles.bandGrid}>
          <ScrollReveal>
            <div className={styles.bandCopy}>
              <Eyebrow labelKey="home.progress.eyebrow" />
              <h2 className={styles.sectionTitle}>{t('home.progress.title')}</h2>
              <p className={styles.prose}>{t('home.progress.body')}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <div className={styles.bandVisual}>
              <MiniProgressDemo />
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  )
}

interface TeaserSpec {
  headingKey: TranslationKey
  lineKey: TranslationKey
  linkKey: TranslationKey
  to: string
}

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
    <section className={styles.teasers}>
      <Container>
        <ScrollReveal>
          <div className={styles.sectionHead}>
            <Eyebrow labelKey="home.explore.eyebrow" />
          </div>
        </ScrollReveal>
        <Stagger className={styles.teaserGrid}>
          {TEASERS.map(({ headingKey, lineKey, linkKey, to }) => (
            <StaggerItem key={headingKey}>
              <Link to={to} className={styles.teaser}>
                <h2 className={styles.teaserHeading}>{t(headingKey)}</h2>
                <p className={styles.teaserLine}>{t(lineKey)}</p>
                <span className={styles.teaserLink}>
                  {t(linkKey)}
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  )
}

function ClosingCta() {
  const { t } = useTranslation()

  return (
    <section className={styles.cta}>
      <Container>
        <ScrollReveal>
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>{t('cta.title')}</h2>
            <p className={styles.ctaBody}>{t('cta.body')}</p>
            <Button to="/signup" variant="primary" size="lg">
              {t('cta.button')}
            </Button>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  )
}

function HomePage() {
  return (
    <>
      <Hero />
      <Reasons />
      <AnswerSection />
      <ProgressBand />
      <Teasers />
      <ClosingCta />
    </>
  )
}

export default HomePage
