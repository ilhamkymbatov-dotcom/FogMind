import { useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CloudFog, FileText, SlidersHorizontal, Waypoints, MessageCircleQuestion, TrendingUp } from 'lucide-react'
import { useTranslation, type TranslationKey } from '../../i18n'
import { Container } from '../components/Container'
import { CtaBand } from '../components/CtaBand'
import { Eyebrow } from '../components/Eyebrow'
import { PageHero } from '../components/PageHero'
import { MiniGraphDemo } from '../components/demos/MiniGraphDemo'
import { MiniProgressDemo } from '../components/demos/MiniProgressDemo'
import { MiniQuestionDemo } from '../components/demos/MiniQuestionDemo'
import { Surface, SurfaceGroup, SurfaceItem, useStaticReveal } from '../components/motion/Surface'
import { TiltCard } from '../components/motion/TiltCard'
import { InkBackdrop } from '../components/fx/SectionBackdrop'
import styles from './ProductPage.module.css'

/*
 * Product is the showcase, and it is built as a gallery you operate rather than
 * a story you scroll. Pick a capability from the rail and the stage swaps to
 * the live demo for it; below, a tinted grid holds the rest. Neither shape
 * appears on Home (a cinematic stage) or How it works (a numbered rail).
 */

interface CapabilitySpec {
  icon: typeof Waypoints
  titleKey: TranslationKey
  bodyKey: TranslationKey
  visual: React.ReactNode
}

const CAPABILITIES: readonly CapabilitySpec[] = [
  {
    icon: Waypoints,
    titleKey: 'product.graph.title',
    bodyKey: 'product.graph.body',
    visual: <MiniGraphDemo />,
  },
  {
    icon: MessageCircleQuestion,
    titleKey: 'product.questions.title',
    bodyKey: 'product.questions.body',
    visual: <MiniQuestionDemo />,
  },
  {
    icon: TrendingUp,
    titleKey: 'product.progress.title',
    bodyKey: 'product.progress.body',
    visual: <MiniProgressDemo />,
  },
]

/**
 * The gallery. A list of capabilities on the left drives a stage on the right.
 * Implemented as a proper tab set: arrow keys move between capabilities, and
 * only the selected panel is exposed.
 */
function Gallery() {
  const { t } = useTranslation()
  const reduced = useStaticReveal()
  const [active, setActive] = useState(0)
  const baseId = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const focusTab = (index: number) => {
    const next = (index + CAPABILITIES.length) % CAPABILITIES.length
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault()
      focusTab(active + 1)
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault()
      focusTab(active - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusTab(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusTab(CAPABILITIES.length - 1)
    }
  }

  const current = CAPABILITIES[active]

  return (
    <section className={styles.gallery}>
      <InkBackdrop tone="ink" />
      <Container className={styles.layer}>
        <Surface from="left" distance={70}>
          <div className={styles.galleryHead}>
            <Eyebrow labelKey="product.gallery.eyebrow" tone="ink" />
            <h2 className={styles.galleryTitle}>{t('product.gallery.title')}</h2>
          </div>
        </Surface>

        <div className={styles.galleryGrid}>
          <div
            className={styles.tabs}
            role="tablist"
            aria-orientation="vertical"
            aria-label={t('product.gallery.title')}
            onKeyDown={onKeyDown}
          >
            {CAPABILITIES.map(({ icon: Icon, titleKey }, index) => (
              <motion.button
                key={titleKey}
                ref={(node) => {
                  tabRefs.current[index] = node
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${index}`}
                aria-selected={index === active}
                aria-controls={`${baseId}-panel-${index}`}
                tabIndex={index === active ? 0 : -1}
                className={[styles.tab, index === active ? styles.tabActive : ''].filter(Boolean).join(' ')}
                onClick={() => setActive(index)}
                initial={reduced ? false : { opacity: 0, x: -40, filter: 'blur(4px)' }}
                whileInView={reduced ? undefined : { opacity: 1, x: 0, filter: 'blur(0px)' }}
                viewport={{ once: false, margin: '-8% 0px' }}
                transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reduced ? undefined : { x: 5 }}
                whileTap={reduced ? undefined : { scale: 0.985 }}
              >
                {/* One marker that slides between capabilities as they change. */}
                {index === active && !reduced ? (
                  <motion.span layoutId={`${baseId}-active`} className={styles.tabMarker} aria-hidden="true" />
                ) : null}
                <span className={styles.tabIcon}>
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className={styles.tabLabel}>{t(titleKey)}</span>
              </motion.button>
            ))}
          </div>

          <div
            className={styles.stage}
            role="tabpanel"
            id={`${baseId}-panel-${active}`}
            aria-labelledby={`${baseId}-tab-${active}`}
            tabIndex={0}
          >
            {/* Keyed so each capability mounts its own demo instance, and the
                outgoing one surfaces away as the incoming one rises. */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.titleKey}
                className={styles.stageInner}
                initial={reduced ? false : { opacity: 0, scale: 0.965, y: 16, filter: 'blur(6px)' }}
                animate={reduced ? undefined : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.985, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.stageVisual}>{current.visual}</div>
                <p className={styles.stageBody}>{t(current.bodyKey)}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  )
}

/** The rest of the capabilities, as a tinted grid. */
interface DetailSpec {
  icon: typeof CloudFog
  titleKey: TranslationKey
  bodyKey: TranslationKey
  tone: 'plum' | 'moss' | 'sand'
  chips?: boolean
}

const DETAILS: readonly DetailSpec[] = [
  { icon: CloudFog, titleKey: 'product.fog.title', bodyKey: 'product.fog.body', tone: 'plum' },
  {
    icon: SlidersHorizontal,
    titleKey: 'product.adaptive.title',
    bodyKey: 'product.adaptive.body',
    tone: 'moss',
  },
  {
    icon: FileText,
    titleKey: 'product.formats.title',
    bodyKey: 'product.formats.body',
    tone: 'sand',
    chips: true,
  },
]

function Details() {
  const { t } = useTranslation()
  const formats = ['PDF', 'DOCX', 'Markdown', t('product.formats.plain')]

  return (
    <section className={styles.details}>
      <Container>
        <Surface from="right" distance={70}>
          <div className={styles.detailsHead}>
            <Eyebrow labelKey="product.more.eyebrow" tone="plum" />
            <h2 className={styles.detailsTitle}>{t('product.more.title')}</h2>
          </div>
        </Surface>

        <SurfaceGroup className={styles.detailGrid} stagger={0.12}>
          {DETAILS.map(({ icon: Icon, titleKey, bodyKey, tone, chips }, index) => (
            <SurfaceItem
              key={titleKey}
              from={index === 0 ? 'left' : index === 2 ? 'right' : 'below'}
              distance={index === 1 ? 44 : 90}
            >
              <TiltCard className={[styles.detail, styles[tone]].join(' ')}>
                <span className={styles.detailIcon}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3 className={styles.detailTitle}>{t(titleKey)}</h3>
                <p className={styles.detailBody}>{t(bodyKey)}</p>
                {chips ? (
                  <div className={styles.chips}>
                    {formats.map((label) => (
                      <span key={label} className={styles.chip}>
                        {label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </TiltCard>
            </SurfaceItem>
          ))}
        </SurfaceGroup>
      </Container>
    </section>
  )
}

function ProductPage() {
  return (
    <>
      <PageHero
        eyebrowKey="product.hero.eyebrow"
        titleKey="product.hero.title"
        subtitleKey="product.hero.subtitle"
        tone="ink"
      />
      <Gallery />
      <Details />
      <CtaBand tone="plum" />
    </>
  )
}

export default ProductPage
