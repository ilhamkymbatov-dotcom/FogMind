import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { CircleCheck, CloudFog, MessageCircleQuestion } from 'lucide-react'
import { useTranslation, type TranslationKey } from '../../i18n'
import { Container } from '../components/Container'
import { CtaBand } from '../components/CtaBand'
import { Eyebrow } from '../components/Eyebrow'
import { PageHero } from '../components/PageHero'
import { MiniGraphDemo } from '../components/demos/MiniGraphDemo'
import { MiniProgressDemo } from '../components/demos/MiniProgressDemo'
import { MiniUploadDemo } from '../components/demos/MiniUploadDemo'
import { Surface, useStaticReveal } from '../components/motion/Surface'
import { LightSweepBackdrop } from '../components/fx/SectionBackdrop'
import { BookmarkRibbon } from '../components/paper/BookmarkRibbon'
import { HandMark } from '../components/paper/HandMark'
import styles from './HowItWorksPage.module.css'

/*
 * How it works is a journey. One continuous rail runs down the page with a
 * numbered stop for every step, and the reader travels it top to bottom. That
 * shape is unique to this page: Home opens on a cinematic stage and Product is
 * a gallery, neither of them uses a rail.
 */

const ACCENT = '#0055ff'

/*
 * The map that closes the journey is bespoke generated geometry (circles and
 * lines), not iconography, so it is drawn with SVG primitives rather than
 * lucide. The icon rule (lucide only, no pasted SVG artwork) still holds.
 */
interface NodeSpec {
  x: number
  y: number
  r: number
  cleared: boolean
}

const NODES: readonly NodeSpec[] = [
  { x: 200, y: 150, r: 12, cleared: true },
  { x: 100, y: 70, r: 9, cleared: true },
  { x: 300, y: 80, r: 9, cleared: false },
  { x: 90, y: 220, r: 9, cleared: false },
  { x: 305, y: 225, r: 9, cleared: true },
  { x: 200, y: 45, r: 8, cleared: false },
  { x: 150, y: 265, r: 8, cleared: false },
]

const EDGES: readonly [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 5],
  [2, 5],
  [3, 6],
]

/** The finished map, with the legend that names the three node states. */
function ClearedMap() {
  const { t } = useTranslation()

  return (
    <div className={styles.mapPanel}>
      <svg viewBox="0 0 400 300" className={styles.mapSvg} aria-hidden="true">
        {EDGES.map(([a, b], index) => (
          <line
            key={index}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            stroke="#d8d2ca"
            strokeWidth={1.2}
          />
        ))}
        {NODES.map((node, index) => (
          <circle
            key={index}
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill={node.cleared ? ACCENT : '#ffffff'}
            stroke={node.cleared ? ACCENT : '#16130f'}
            strokeWidth={1.5}
          />
        ))}
      </svg>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <CloudFog size={14} aria-hidden="true" />
          {t('hiw.fog.stage1')}
        </span>
        <span className={styles.legendItem}>
          <MessageCircleQuestion size={14} aria-hidden="true" />
          {t('hiw.fog.stage2')}
        </span>
        <span className={styles.legendItem}>
          <CircleCheck size={14} aria-hidden="true" color={ACCENT} />
          {t('hiw.fog.stage3')}
        </span>
      </div>
    </div>
  )
}

interface StopSpec {
  titleKey: TranslationKey
  bodyKey: TranslationKey
  visual?: ReactNode
  /** An annotation pencilled in beside the visual, with an arrow to it. */
  noteKey?: TranslationKey
}

const STOPS: readonly StopSpec[] = [
  { titleKey: 'hiw.upload.title', bodyKey: 'hiw.upload.body', visual: <MiniUploadDemo /> },
  { titleKey: 'hiw.reads.title', bodyKey: 'hiw.reads.body' },
  { titleKey: 'hiw.map.title', bodyKey: 'hiw.map.body', visual: <MiniGraphDemo /> },
  { titleKey: 'hiw.fog.title', bodyKey: 'hiw.fog.body', visual: <ClearedMap />, noteKey: 'hiw.mapNote' },
  { titleKey: 'hiw.adaptive.title', bodyKey: 'hiw.adaptive.body', visual: <MiniProgressDemo /> },
]

/**
 * The marker attaches to the rail as the reader reaches it: the dot lands from
 * slightly back in depth and a short connector reaches out to the copy.
 */
function Marker({ index }: { index: number }) {
  const reduced = useStaticReveal()

  if (reduced) {
    return (
      <div className={styles.marker} aria-hidden="true">
        <span className={styles.dot}>{index + 1}</span>
      </div>
    )
  }

  return (
    <motion.div
      className={styles.marker}
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.4, z: -60 }}
      whileInView={{ opacity: 1, scale: 1, z: 0 }}
      viewport={{ once: false, margin: '-12% 0px -20% 0px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 800 }}
    >
      <span className={styles.dot}>{index + 1}</span>
      <motion.span
        className={styles.connector}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: false, margin: '-12% 0px -20% 0px' }}
        transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  )
}

/** One stop on the rail: a numbered marker, the copy, and an optional visual. */
function Stop({ stop, index }: { stop: StopSpec; index: number }) {
  const { t } = useTranslation()

  return (
    <div className={styles.stop}>
      <Marker index={index} />

      <Surface from="right" distance={64} delay={0.06} className={styles.stopBody}>
        <span className={styles.stopStep}>{t('hiw.stepN', { n: index + 1 })}</span>
        <h2 className={styles.stopTitle}>{t(stop.titleKey)}</h2>
        <p className={styles.stopText}>{t(stop.bodyKey)}</p>
      </Surface>

      {stop.visual ? (
        <Surface from="right" distance={110} delay={0.16} blur={6} className={styles.stopVisual}>
          {stop.visual}
          {stop.noteKey ? (
            <span className={styles.annotation}>
              <span className={styles.annotationText}>{t(stop.noteKey)}</span>
              <HandMark kind="arrow" className={styles.annotationArrow} delay={0.5} />
            </span>
          ) : null}
        </Surface>
      ) : null}
    </div>
  )
}

function Journey() {
  const { t } = useTranslation()
  const reduced = useStaticReveal()
  const railRef = useRef<HTMLOListElement>(null)

  // The page's signature: the path is drawn by the reader's own scrolling,
  // filling from the first stop to the last as they travel down it.
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ['start 72%', 'end 65%'],
  })
  const drawn = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })
  const scaleY = useTransform(drawn, (v) => Math.max(0.001, v))

  return (
    <section className={styles.journey}>
      <LightSweepBackdrop tone="moss" />
      <BookmarkRibbon tone="moss" />
      <Container className={styles.layer}>
        <div className={styles.journeyHead}>
          <Surface from="left" distance={80} className={styles.journeyLeadCol}>
            <Eyebrow labelKey="hiw.intake.eyebrow" tone="moss" />
            <h2 className={styles.journeyTitle}>{t('hiw.intake.title')}</h2>
          </Surface>
          <Surface from="right" distance={80} delay={0.1}>
            <p className={styles.journeyLead}>{t('hiw.intake.body')}</p>
          </Surface>
        </div>

        {/* The rail is the page's structure, drawn behind the stops. */}
        <ol className={styles.rail} ref={railRef}>
          <span className={styles.railTrack} aria-hidden="true" />
          {reduced ? (
            <span className={[styles.railLine, styles.railLineStatic].join(' ')} aria-hidden="true" />
          ) : (
            <motion.span className={styles.railLine} style={{ scaleY }} aria-hidden="true" />
          )}
          {STOPS.map((stop, index) => (
            <li key={stop.titleKey}>
              <Stop stop={stop} index={index} />
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}

function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrowKey="hiw.hero.eyebrow"
        titleKey="hiw.hero.title"
        subtitleKey="hiw.hero.subtitle"
        tone="moss"
      />
      <Journey />
      <CtaBand tone="sand" />
    </>
  )
}

export default HowItWorksPage
