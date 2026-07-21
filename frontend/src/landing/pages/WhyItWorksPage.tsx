import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation, type TranslationKey } from '../../i18n'
import { Container } from '../components/Container'
import { CtaBand } from '../components/CtaBand'
import { PageHero } from '../components/PageHero'
import { ScrollReveal } from '../components/motion/ScrollReveal'
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

/**
 * A small comparison built from CSS: the weak habit on top, the one that works
 * beneath. Decorative, so the shapes are hidden and only the labels are read.
 */
function Diagram({ variant, aKey, bKey }: { variant: DiagramVariant; aKey: TranslationKey; bKey: TranslationKey }) {
  const { t } = useTranslation()

  const shapes = (strong: boolean) => {
    if (variant === 'bars') {
      return <span className={styles.bar} style={{ width: strong ? '100%' : '34%' }} />
    }
    if (variant === 'spacing') {
      return strong ? (
        <span className={styles.spread}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={styles.tick} />
          ))}
        </span>
      ) : (
        <span className={styles.block} />
      )
    }
    if (variant === 'structure') {
      return (
        <span className={[styles.cluster, strong ? styles.clusterLinked : ''].filter(Boolean).join(' ')}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={styles.dot} />
          ))}
        </span>
      )
    }
    return (
      <span className={styles.track}>
        <span className={styles.fill} style={{ width: strong ? '72%' : '0%' }} />
      </span>
    )
  }

  return (
    <div className={styles.diagram} role="group">
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
    </div>
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
    <ScrollReveal delay={0.03} className={styles.principle}>
      <span className={styles.numeral} aria-hidden="true">
        {index + 1}
      </span>
      <div className={styles.principleBody}>
        <h2 className={styles.principleTitle}>{t(spec.titleKey)}</h2>
        <p className={styles.para}>{t(spec.failsKey)}</p>
        <Diagram variant={spec.variant} aKey={spec.aKey} bKey={spec.bKey} />
        <p className={styles.para}>{t(spec.holdsKey)}</p>
        <p className={styles.commitment}>{t(spec.usKey)}</p>
      </div>
    </ScrollReveal>
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
          <ScrollReveal>
            <p className={styles.lead}>{t('why.lead')}</p>
          </ScrollReveal>

          {PRINCIPLES.slice(0, 2).map((spec, i) => (
            <Principle key={spec.titleKey} spec={spec} index={i} />
          ))}
        </Container>
      </section>

      {/* The quote breaks the column and the room, halfway down. */}
      <section className={styles.quoteBand}>
        <Container>
          <ScrollReveal>
            <blockquote className={styles.quote}>{t('why.quote')}</blockquote>
          </ScrollReveal>
        </Container>
      </section>

      <section className={styles.essayLower}>
        <Container>
          {PRINCIPLES.slice(2).map((spec, i) => (
            <Principle key={spec.titleKey} spec={spec} index={i + 2} />
          ))}

          <ScrollReveal>
            <div className={styles.endnote}>
              <p className={styles.endnoteTitle}>{t('why.next.title')}</p>
              <p className={styles.endnoteBody}>{t('why.next.body')}</p>
              <Link to="/how-it-works" className={styles.endnoteLink}>
                {t('why.next.link')}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      <CtaBand tone="sand" />
    </>
  )
}

export default WhyItWorksPage
