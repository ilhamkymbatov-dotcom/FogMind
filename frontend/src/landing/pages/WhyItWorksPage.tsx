import { motion, type Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation, type TranslationKey } from '../../i18n'
import { Container } from '../components/Container'
import { CtaBand } from '../components/CtaBand'
import { PageHero } from '../components/PageHero'
import { Surface } from '../components/motion/Surface'
import { LightSweepBackdrop } from '../components/fx/SectionBackdrop'
import { useStaticReveal } from '../components/motion/Surface'
import styles from './WhyItWorksPage.module.css'

/*
 * Why it works owns the reasoning and nothing else. It describes findings about
 * memory, never the interface: no screens, no buttons, no features. The
 * mechanics live on How it works and the capabilities live on Product, and this
 * page links out to them rather than restating either.
 *
 * The shape is an essay: a lead, four principles with hanging numerals, a small
 * comparison diagram inside each, and a full width quote breaking the column.
 */

type DiagramVariant = 'bars' | 'spacing' | 'structure' | 'signal'

/*
 * The page's signature: each comparison assembles itself as its principle
 * arrives. Bars grow from their origin, the spaced returns land one by one, the
 * loose facts pop in and only then does the link between them draw, and the
 * progress track fills. Everything is scaleX or scale, so the whole thing runs
 * on the compositor.
 */
const EASE = [0.22, 1, 0.36, 1] as const

const assemble: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
}

const growX: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.62, ease: EASE } },
}

const pop: Variants = {
  hidden: { scale: 0, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { duration: 0.4, ease: EASE } },
}

/**
 * A small comparison built from CSS: the weak habit on top, the one that works
 * beneath. Decorative, so the shapes are hidden and only the labels are read.
 */
function Diagram({ variant, aKey, bKey }: { variant: DiagramVariant; aKey: TranslationKey; bKey: TranslationKey }) {
  const { t } = useTranslation()
  const reduced = useStaticReveal()

  // With motion off every shape renders at its finished size.
  const Group = reduced ? 'div' : motion.div
  const Piece = reduced ? 'span' : motion.span
  const groupProps = reduced
    ? {}
    : {
        variants: assemble,
        initial: 'hidden' as const,
        whileInView: 'show' as const,
        viewport: { once: false, margin: '-12% 0px -16% 0px' },
      }

  const shapes = (strong: boolean) => {
    if (variant === 'bars') {
      return (
        <Piece
          className={styles.bar}
          style={{ width: strong ? '100%' : '34%' }}
          {...(reduced ? {} : { variants: growX })}
        />
      )
    }
    if (variant === 'spacing') {
      return strong ? (
        <span className={styles.spread}>
          {[0, 1, 2, 3].map((i) => (
            <Piece key={i} className={styles.tick} {...(reduced ? {} : { variants: pop })} />
          ))}
        </span>
      ) : (
        <Piece className={styles.block} {...(reduced ? {} : { variants: growX })} />
      )
    }
    if (variant === 'structure') {
      return (
        <span className={[styles.cluster, strong ? styles.clusterLinked : ''].filter(Boolean).join(' ')}>
          {strong ? (
            <Piece className={styles.link} {...(reduced ? {} : { variants: growX })} />
          ) : null}
          {[0, 1, 2, 3].map((i) => (
            <Piece key={i} className={styles.dot} {...(reduced ? {} : { variants: pop })} />
          ))}
        </span>
      )
    }
    return (
      <span className={styles.track}>
        <Piece
          className={styles.fill}
          style={{ width: strong ? '72%' : '0%' }}
          {...(reduced ? {} : { variants: growX })}
        />
      </span>
    )
  }

  return (
    <Group className={styles.diagram} role="group" {...groupProps}>
      <div className={styles.row}>
        <span className={styles.rowLabel}>{t(aKey)}</span>
        <span className={styles.rowShape} aria-hidden="true">
          {shapes(false)}
        </span>
      </div>
      <div className={[styles.row, styles.rowStrong].join(' ')}>
        <span className={styles.rowLabel}>{t(bKey)}</span>
        <span className={styles.rowShape} aria-hidden="true">
          {shapes(true)}
        </span>
      </div>
    </Group>
  )
}

interface PrincipleSpec {
  titleKey: TranslationKey
  failsKey: TranslationKey
  holdsKey: TranslationKey
  usKey: TranslationKey
  aKey: TranslationKey
  bKey: TranslationKey
  variant: DiagramVariant
}

const PRINCIPLES: readonly PrincipleSpec[] = [
  {
    titleKey: 'why.p1.title',
    failsKey: 'why.p1.fails',
    holdsKey: 'why.p1.holds',
    usKey: 'why.p1.us',
    aKey: 'why.p1.a',
    bKey: 'why.p1.b',
    variant: 'bars',
  },
  {
    titleKey: 'why.p2.title',
    failsKey: 'why.p2.fails',
    holdsKey: 'why.p2.holds',
    usKey: 'why.p2.us',
    aKey: 'why.p2.a',
    bKey: 'why.p2.b',
    variant: 'spacing',
  },
  {
    titleKey: 'why.p3.title',
    failsKey: 'why.p3.fails',
    holdsKey: 'why.p3.holds',
    usKey: 'why.p3.us',
    aKey: 'why.p3.a',
    bKey: 'why.p3.b',
    variant: 'structure',
  },
  {
    titleKey: 'why.p4.title',
    failsKey: 'why.p4.fails',
    holdsKey: 'why.p4.holds',
    usKey: 'why.p4.us',
    aKey: 'why.p4.a',
    bKey: 'why.p4.b',
    variant: 'signal',
  },
]

function Principle({ spec, index }: { spec: PrincipleSpec; index: number }) {
  const { t } = useTranslation()

  return (
    <div className={styles.principle}>
      <Surface from="left" distance={56} blur={0}>
        <span className={styles.numeral} aria-hidden="true">
          {index + 1}
        </span>
      </Surface>
      <Surface from="right" distance={72} delay={0.08} className={styles.principleBody}>
        <h2 className={styles.principleTitle}>{t(spec.titleKey)}</h2>
        <p className={styles.para}>{t(spec.failsKey)}</p>
        <Diagram variant={spec.variant} aKey={spec.aKey} bKey={spec.bKey} />
        <p className={styles.para}>{t(spec.holdsKey)}</p>
        <p className={styles.commitment}>{t(spec.usKey)}</p>
      </Surface>
    </div>
  )
}

function WhyItWorksPage() {
  const { t } = useTranslation()

  return (
    <>
      <PageHero
        eyebrowKey="why.hero.eyebrow"
        titleKey="why.hero.title"
        subtitleKey="why.hero.subtitle"
        tone="ink"
      />

      <section className={styles.essay}>
        <Container>
          <Surface from="left" distance={70} blur={0}>
            <p className={styles.lead}>{t('why.lead')}</p>
          </Surface>

          {PRINCIPLES.slice(0, 2).map((spec, i) => (
            <Principle key={spec.titleKey} spec={spec} index={i} />
          ))}
        </Container>
      </section>

      {/* The quote breaks the column and the room, halfway down. */}
      <section className={styles.quoteBand}>
        <LightSweepBackdrop tone="ink" />
        <Container className={styles.layer}>
          <Surface from="below" distance={40} blur={7}>
            <blockquote className={styles.quote}>{t('why.quote')}</blockquote>
          </Surface>
        </Container>
      </section>

      <section className={styles.essayLower}>
        <Container>
          {PRINCIPLES.slice(2).map((spec, i) => (
            <Principle key={spec.titleKey} spec={spec} index={i + 2} />
          ))}

          <Surface from="below" distance={44}>
            <div className={styles.endnote}>
              <p className={styles.endnoteTitle}>{t('why.next.title')}</p>
              <p className={styles.endnoteBody}>{t('why.next.body')}</p>
              <Link to="/how-it-works" className={styles.endnoteLink}>
                {t('why.next.link')}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </Surface>
        </Container>
      </section>

      <CtaBand tone="sand" />
    </>
  )
}

export default WhyItWorksPage
