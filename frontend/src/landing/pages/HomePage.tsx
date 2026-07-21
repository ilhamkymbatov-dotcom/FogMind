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
import { Surface, SurfaceGroup, SurfaceItem } from '../components/motion/Surface'
import { HeroFogReveal } from '../components/fx/HeroFogReveal'
import { MistBackdrop, ConstellationBackdrop } from '../components/fx/SectionBackdrop'
import { usePointerTilt } from '../components/usePointerTilt'
import { usePrefersReducedMotion } from '../components/motion/useMediaQuery'
import styles from './HomePage.module.css'

/*
 * Home is the emotional pitch, and its shape is deliberately unlike the other
 * two pages: one cinematic opening, one full bleed idea, and two doors out.
 * No card grids and no step rails live here, those belong to Product and How
 * it works respectively.
 */

/**
 * The cinematic opening. The headline is centred and the live map sits below it
 * as a wide stage rather than beside it, so the page opens like a title card.
 */
function Hero() {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const tilt = usePointerTilt({ max: 3.5, shift: 16 })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const backdropY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -50])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.92], [1, 0])

  const copy = (
    <div className={styles.heroCopy}>
      <Eyebrow labelKey="hero.eyebrow" tone="warm" />
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
  )

  const backdrop = (
    <div className={styles.heroBackdrop} aria-hidden="true">
      <span className={styles.washA} />
      <span className={styles.washB} />
      <span className={styles.washC} />
      <Constellation />
    </div>
  )

  return (
    <section ref={ref} className={styles.hero}>
      {reduced ? backdrop : <motion.div style={{ y: backdropY }}>{backdrop}</motion.div>}

      <HeroFogReveal targetRef={ref} />

      <Container className={styles.heroContent}>
        {reduced ? copy : <motion.div style={{ y: copyY, opacity: copyOpacity }}>{copy}</motion.div>}

        <div ref={tilt} className={styles.stage}>
          <div className={styles.stageCard} data-tilt-depth="1">
            <MiniGraphDemo />
          </div>
          <p className={styles.stageCaption}>{t('hero.demoCaption')}</p>
        </div>
      </Container>
    </section>
  )
}

/** The idea, full bleed on a deep sand wash. One statement, three short notes. */
const NOTES: readonly { icon: typeof Waypoints; key: TranslationKey }[] = [
  { icon: Waypoints, key: 'home.card1.title' },
  { icon: MessageCircleQuestion, key: 'home.card2.title' },
  { icon: TrendingUp, key: 'home.card3.title' },
]

function Idea() {
  const { t } = useTranslation()

  return (
    <section className={styles.idea}>
      <ConstellationBackdrop tone="sand" />
      <Container className={styles.layer}>
        <div className={styles.ideaInner}>
          <Surface from="left" distance={90}>
            <div className={styles.ideaLead}>
              <Eyebrow labelKey="home.mood.eyebrow" tone="sand" />
              <h2 className={styles.ideaTitle}>{t('home.mood.title')}</h2>
            </div>
          </Surface>
          <Surface from="right" distance={90} delay={0.1}>
            <p className={styles.ideaBody}>{t('home.mood.body')}</p>
          </Surface>
        </div>

        <SurfaceGroup className={styles.notes} stagger={0.11} delay={0.1}>
          {NOTES.map(({ icon: Icon, key }) => (
            <SurfaceItem key={key} from="below" distance={26} className={styles.note}>
              <Icon size={17} aria-hidden="true" />
              {t(key)}
            </SurfaceItem>
          ))}
        </SurfaceGroup>
      </Container>
    </section>
  )
}

/**
 * The two doors out of Home. Staggered heights and two different washes, so
 * this reads as a pair of chapter openings rather than a card grid.
 */
interface ChapterSpec {
  headingKey: TranslationKey
  lineKey: TranslationKey
  linkKey: TranslationKey
  to: string
  tone: 'moss' | 'ink'
}

const CHAPTERS: readonly ChapterSpec[] = [
  {
    headingKey: 'home.hiw.heading',
    lineKey: 'home.hiw.line',
    linkKey: 'home.hiw.link',
    to: '/how-it-works',
    tone: 'moss',
  },
  {
    headingKey: 'home.product.heading',
    lineKey: 'home.product.line',
    linkKey: 'home.product.link',
    to: '/product',
    tone: 'ink',
  },
]

function Chapters() {
  const { t } = useTranslation()

  return (
    <section className={styles.chapters}>
      <Container>
        <Surface from="none" blur={0}>
          <Eyebrow labelKey="home.explore.eyebrow" tone="plum" />
        </Surface>
        <div className={styles.chapterRow}>
          {CHAPTERS.map(({ headingKey, lineKey, linkKey, to, tone }, index) => (
            <Surface
              key={headingKey}
              from={index === 0 ? 'left' : 'right'}
              distance={120}
              delay={index * 0.08}
              className={styles.chapterCell}
            >
              <Link to={to} className={[styles.chapter, styles[tone]].join(' ')}>
                <span className={styles.chapterIndex}>{`0${index + 1}`}</span>
                <h2 className={styles.chapterHeading}>{t(headingKey)}</h2>
                <p className={styles.chapterLine}>{t(lineKey)}</p>
                <span className={styles.chapterLink}>
                  {t(linkKey)}
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </Link>
            </Surface>
          ))}
        </div>
      </Container>
    </section>
  )
}

function ClosingCta() {
  const { t } = useTranslation()

  return (
    <section className={styles.cta}>
      <MistBackdrop tone="plum" />
      <Container className={styles.layer}>
        <Surface from="below" distance={56}>
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>{t('cta.title')}</h2>
            <p className={styles.ctaBody}>{t('cta.body')}</p>
            <Button to="/signup" variant="primary" size="lg">
              {t('cta.button')}
            </Button>
          </div>
        </Surface>
      </Container>
    </section>
  )
}

function HomePage() {
  return (
    <>
      <Hero />
      <Idea />
      <Chapters />
      <ClosingCta />
    </>
  )
}

export default HomePage
