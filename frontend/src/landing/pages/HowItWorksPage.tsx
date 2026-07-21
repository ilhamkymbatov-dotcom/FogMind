import { useScroll, useMotionValueEvent } from 'framer-motion'
import { useRef, useState } from 'react'
import { CircleCheck, CloudFog, MessageCircleQuestion } from 'lucide-react'
import { useTranslation, type TranslationKey } from '../../i18n'
import { Container } from '../components/Container'
import { CtaBand } from '../components/CtaBand'
import { PageHero } from '../components/PageHero'
import { ScrollReveal } from '../components/motion/ScrollReveal'
import { useMediaQuery, usePrefersReducedMotion } from '../components/motion/useMediaQuery'
import styles from './HowItWorksPage.module.css'

interface StepSpec {
  titleKey: TranslationKey
  bodyKey: TranslationKey
}

const STEPS: readonly StepSpec[] = [
  { titleKey: 'hiw.upload.title', bodyKey: 'hiw.upload.body' },
  { titleKey: 'hiw.reads.title', bodyKey: 'hiw.reads.body' },
  { titleKey: 'hiw.map.title', bodyKey: 'hiw.map.body' },
  { titleKey: 'hiw.fog.title', bodyKey: 'hiw.fog.body' },
  { titleKey: 'hiw.adaptive.title', bodyKey: 'hiw.adaptive.body' },
]

/*
 * The journey graph is bespoke generated geometry (circles and lines), not
 * iconography, so it is drawn with SVG primitives rather than lucide. The
 * icon rule (lucide only, no pasted SVG artwork) still holds everywhere.
 */
interface NodeSpec {
  x: number
  y: number
  r: number
  /** Filled with the accent when its fog clears. */
  accent: boolean
}

const NODES: readonly NodeSpec[] = [
  { x: 200, y: 150, r: 12, accent: true },
  { x: 100, y: 70, r: 9, accent: true },
  { x: 300, y: 80, r: 9, accent: false },
  { x: 90, y: 220, r: 9, accent: false },
  { x: 305, y: 225, r: 9, accent: true },
  { x: 200, y: 45, r: 8, accent: false },
  { x: 150, y: 265, r: 8, accent: false },
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

const ACCENT = '#0055ff'
const NODE_STROKE = '#111111'
const EDGE_STROKE = '#d4d4d4'
const FOG_FILL = '#cfcfcf'

interface JourneyGraphProps {
  /** 0 upload, 1 structure, 2 map, 3 fog clears, 4 progress. */
  step: number
  /** When false, everything renders in its final state with no transitions. */
  animated: boolean
}

function JourneyGraph({ step, animated }: JourneyGraphProps) {
  const { t } = useTranslation()

  const transition = (extra: string, delay = 0) =>
    animated ? { transition: extra, transitionDelay: `${delay}ms` } : { transition: 'none' }

  return (
    <div className={styles.graphPanel}>
      <svg viewBox="0 0 400 300" className={styles.graphSvg} aria-hidden="true">
        <defs>
          <filter id="journeyFog" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        {EDGES.map(([a, b], index) => {
          const from = NODES[a]
          const to = NODES[b]
          const length = Math.hypot(to.x - from.x, to.y - from.y)
          const drawn = step >= 2
          return (
            <line
              key={index}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={EDGE_STROKE}
              strokeWidth={1.2}
              strokeDasharray={length}
              strokeDashoffset={drawn ? 0 : length}
              style={transition('stroke-dashoffset 700ms ease', index * 90)}
            />
          )
        })}

        {NODES.map((node, index) => {
          const visible = index === 0 ? step >= 0 : step >= 1
          const cleared = step >= 3 && node.accent
          const mastered = step >= 4
          return (
            <circle
              key={index}
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill={cleared ? ACCENT : '#ffffff'}
              stroke={mastered ? ACCENT : NODE_STROKE}
              strokeWidth={mastered ? 2 : 1.5}
              opacity={visible ? 1 : 0}
              style={transition('opacity 500ms ease, fill 400ms ease, stroke 400ms ease', index * 70)}
            />
          )
        })}

        {/* The fog rolls over the finished map, then burns off node by node. */}
        {NODES.map((node, index) => {
          const foggy = step === 2
          return (
            <circle
              key={`fog-${index}`}
              cx={node.x}
              cy={node.y}
              r={node.r + 16}
              fill={FOG_FILL}
              filter="url(#journeyFog)"
              opacity={foggy ? 0.9 : 0}
              style={transition('opacity 600ms ease', index * 110)}
            />
          )
        })}
      </svg>

      <div className={styles.legend} style={{ opacity: !animated || step >= 3 ? 1 : 0 }}>
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

/** Narrow screens and reduced motion get the full story without pinning. */
function StackedJourney() {
  const { t } = useTranslation()

  return (
    <Container>
      <div className={styles.stacked}>
        <ScrollReveal>
          <JourneyGraph step={4} animated={false} />
        </ScrollReveal>
        {STEPS.map(({ titleKey, bodyKey }, index) => (
          <ScrollReveal key={titleKey} delay={index * 0.04}>
            <div className={styles.stackedStep}>
              <h2 className={styles.stackedTitle}>{t(titleKey)}</h2>
              <p className={styles.stackedBody}>{t(bodyKey)}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </Container>
  )
}

/**
 * The pinned sequence: the graph panel stays fixed on the right while
 * scrolling advances through the five steps, each one adding to the graph.
 */
function PinnedJourney() {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const wide = useMediaQuery('(min-width: 861px)')
  const [step, setStep] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = Math.min(STEPS.length - 1, Math.max(0, Math.floor(value * STEPS.length)))
    setStep(next)
  })

  if (reduced || !wide) {
    return <StackedJourney />
  }

  return (
    <section ref={ref} className={styles.journey}>
      <div className={styles.sticky}>
        <Container>
          <div className={styles.grid}>
            <div>
              <div className={styles.steps}>
                {STEPS.map(({ titleKey }, index) => (
                  <div
                    key={titleKey}
                    className={[styles.stepRow, index === step ? styles.stepRowActive : '']
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span className={styles.stepIndex}>{index + 1}</span>
                    <span className={styles.stepTitle}>{t(titleKey)}</span>
                  </div>
                ))}
              </div>
              {/* Remounting on step change re-runs the small entrance. */}
              <p key={step} className={styles.stepBody}>
                {t(STEPS[step].bodyKey)}
              </p>
            </div>
            <JourneyGraph step={step} animated />
          </div>
        </Container>
      </div>
    </section>
  )
}

function HowItWorksPage() {
  return (
    <>
      <PageHero titleKey="hiw.hero.title" subtitleKey="hiw.hero.subtitle" />
      <PinnedJourney />
      <CtaBand />
    </>
  )
}

export default HowItWorksPage
