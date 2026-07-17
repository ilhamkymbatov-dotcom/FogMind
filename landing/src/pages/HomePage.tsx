import {
  Eye,
  MessageCircleQuestion,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Waypoints,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation, type TranslationKey } from '../i18n'
import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { ScrollReveal } from '../components/motion/ScrollReveal'
import styles from './HomePage.module.css'

interface CardSpec {
  icon: LucideIcon
  titleKey: TranslationKey
  bodyKey: TranslationKey
}

const STEP_CARDS: readonly CardSpec[] = [
  { icon: Upload, titleKey: 'steps.upload.title', bodyKey: 'steps.upload.body' },
  { icon: Waypoints, titleKey: 'steps.map.title', bodyKey: 'steps.map.body' },
  { icon: MessageCircleQuestion, titleKey: 'steps.clear.title', bodyKey: 'steps.clear.body' },
]

const FEATURE_CARDS: readonly CardSpec[] = [
  { icon: Sparkles, titleKey: 'features.questions.title', bodyKey: 'features.questions.body' },
  { icon: SlidersHorizontal, titleKey: 'features.adaptive.title', bodyKey: 'features.adaptive.body' },
  { icon: Eye, titleKey: 'features.progress.title', bodyKey: 'features.progress.body' },
]

function CardGrid({ cards }: { cards: readonly CardSpec[] }) {
  const { t } = useTranslation()

  return (
    <div className={styles.grid}>
      {cards.map(({ icon: Icon, titleKey, bodyKey }, index) => (
        <ScrollReveal key={titleKey} delay={index * 0.08}>
          <div className={styles.card}>
            <Icon className={styles.cardIcon} size={24} aria-hidden="true" />
            <h3 className={styles.cardTitle}>{t(titleKey)}</h3>
            <p className={styles.cardBody}>{t(bodyKey)}</p>
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
          <ScrollReveal>
            <h2 className={styles.sectionTitle}>{t('steps.title')}</h2>
          </ScrollReveal>
          <CardGrid cards={STEP_CARDS} />
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <ScrollReveal>
            <h2 className={styles.sectionTitle}>{t('features.title')}</h2>
          </ScrollReveal>
          <CardGrid cards={FEATURE_CARDS} />
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
