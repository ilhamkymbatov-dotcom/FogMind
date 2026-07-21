import { CloudFog, FileText, SlidersHorizontal } from 'lucide-react'
import { useTranslation, type TranslationKey } from '../../i18n'
import { Container } from '../components/Container'
import { CtaBand } from '../components/CtaBand'
import { Eyebrow } from '../components/Eyebrow'
import { PageHero } from '../components/PageHero'
import { MiniGraphDemo } from '../components/demos/MiniGraphDemo'
import { MiniProgressDemo } from '../components/demos/MiniProgressDemo'
import { MiniQuestionDemo } from '../components/demos/MiniQuestionDemo'
import { ScrollReveal } from '../components/motion/ScrollReveal'
import { Stagger, StaggerItem } from '../components/motion/Stagger'
import styles from './ProductPage.module.css'

/**
 * The product page varies its rhythm on purpose: a wide feature, a mirrored
 * feature, a full width band and a row of three cards. Every visual is a live
 * demo of the real thing, so nothing on the page is a placeholder.
 */

interface FeatureProps {
  eyebrowKey: TranslationKey
  titleKey: TranslationKey
  bodyKey: TranslationKey
  visual: React.ReactNode
  /** Puts the visual first on wide screens. */
  mirrored?: boolean
}

function Feature({ eyebrowKey, titleKey, bodyKey, visual, mirrored = false }: FeatureProps) {
  const { t } = useTranslation()

  return (
    <section className={styles.feature}>
      <Container>
        <div className={[styles.featureGrid, mirrored ? styles.mirrored : ''].filter(Boolean).join(' ')}>
          <ScrollReveal>
            <div className={styles.featureCopy}>
              <Eyebrow labelKey={eyebrowKey} />
              <h2 className={styles.title}>{t(titleKey)}</h2>
              <p className={styles.prose}>{t(bodyKey)}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <div className={styles.featureVisual}>{visual}</div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  )
}

/** The formats card lists what you can actually bring, as real chips. */
function Formats() {
  const { t } = useTranslation()
  const formats = ['PDF', 'DOCX', 'Markdown', t('product.formats.plain')]

  return (
    <div className={styles.chips}>
      {formats.map((label) => (
        <span key={label} className={styles.chip}>
          <FileText size={14} aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  )
}

interface SmallCardSpec {
  icon: typeof CloudFog
  titleKey: TranslationKey
  bodyKey: TranslationKey
  extra?: React.ReactNode
}

function MoreCards() {
  const { t } = useTranslation()

  const cards: readonly SmallCardSpec[] = [
    { icon: CloudFog, titleKey: 'product.fog.title', bodyKey: 'product.fog.body' },
    { icon: SlidersHorizontal, titleKey: 'product.adaptive.title', bodyKey: 'product.adaptive.body' },
    {
      icon: FileText,
      titleKey: 'product.formats.title',
      bodyKey: 'product.formats.body',
      extra: <Formats />,
    },
  ]

  return (
    <section className={styles.more}>
      <Container>
        <ScrollReveal>
          <div className={styles.sectionHead}>
            <Eyebrow labelKey="product.more.eyebrow" />
            <h2 className={styles.title}>{t('product.more.title')}</h2>
          </div>
        </ScrollReveal>
        <Stagger className={styles.moreGrid}>
          {cards.map(({ icon: Icon, titleKey, bodyKey, extra }) => (
            <StaggerItem key={titleKey}>
              <article className={styles.card}>
                <span className={styles.cardIcon}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3 className={styles.cardTitle}>{t(titleKey)}</h3>
                <p className={styles.cardBody}>{t(bodyKey)}</p>
                {extra}
              </article>
            </StaggerItem>
          ))}
        </Stagger>
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
      />

      <Feature
        eyebrowKey="product.graph.eyebrow"
        titleKey="product.graph.title"
        bodyKey="product.graph.body"
        visual={
          <div className={styles.raised}>
            <MiniGraphDemo />
          </div>
        }
      />

      <Feature
        eyebrowKey="product.questions.eyebrow"
        titleKey="product.questions.title"
        bodyKey="product.questions.body"
        visual={<MiniQuestionDemo />}
        mirrored
      />

      {/* Full width band breaks the two column rhythm. */}
      <section className={styles.band}>
        <Container>
          <div className={styles.bandGrid}>
            <ScrollReveal>
              <div className={styles.featureCopy}>
                <Eyebrow labelKey="product.progress.eyebrow" />
                <ProgressHeading />
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

      <MoreCards />
      <CtaBand />
    </>
  )
}

function ProgressHeading() {
  const { t } = useTranslation()
  return (
    <>
      <h2 className={styles.title}>{t('product.progress.title')}</h2>
      <p className={styles.prose}>{t('product.progress.body')}</p>
    </>
  )
}

export default ProductPage
