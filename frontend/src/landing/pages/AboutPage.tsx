import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation, type TranslationKey } from '../../i18n'
import { Container } from '../components/Container'
import { CtaBand } from '../components/CtaBand'
import { PageHero } from '../components/PageHero'
import { ScrollReveal } from '../components/motion/ScrollReveal'
import styles from './AboutPage.module.css'

/*
 * About owns the story and the philosophy: why this exists, the belief under
 * it, where the fog metaphor came from and where the project is going. It says
 * nothing about audiences (Who it is for) and nothing about the evidence (Why
 * it works), and links to the latter instead of arguing it here.
 *
 * The shape is a manifesto: stanzas with hanging labels down the left, one
 * narrow column of first person prose, and a single full width line.
 */

const STANZAS: readonly { labelKey: TranslationKey; bodyKey: TranslationKey }[] = [
  { labelKey: 'about.s1.label', bodyKey: 'about.s1.body' },
  { labelKey: 'about.s2.label', bodyKey: 'about.s2.body' },
  { labelKey: 'about.s3.label', bodyKey: 'about.s3.body' },
  { labelKey: 'about.s4.label', bodyKey: 'about.s4.body' },
  { labelKey: 'about.s5.label', bodyKey: 'about.s5.body' },
]

function AboutPage() {
  const { t } = useTranslation()

  // The metaphor stanza gets the full width line after it.
  const before = STANZAS.slice(0, 3)
  const after = STANZAS.slice(3)

  return (
    <>
      <PageHero
        eyebrowKey="about.hero.eyebrow"
        titleKey="about.hero.title"
        subtitleKey="about.hero.subtitle"
        tone="sand"
      />

      <section className={styles.manifesto}>
        <Container>
          {before.map(({ labelKey, bodyKey }) => (
            <ScrollReveal key={labelKey} delay={0.03} className={styles.stanza}>
              <span className={styles.label}>{t(labelKey)}</span>
              <p className={styles.body}>{t(bodyKey)}</p>
            </ScrollReveal>
          ))}
        </Container>
      </section>

      <section className={styles.pullBand}>
        <Container>
          <ScrollReveal>
            <p className={styles.pull}>{t('about.pull')}</p>
          </ScrollReveal>
        </Container>
      </section>

      <section className={styles.manifestoLower}>
        <Container>
          {after.map(({ labelKey, bodyKey }) => (
            <ScrollReveal key={labelKey} delay={0.03} className={styles.stanza}>
              <span className={styles.label}>{t(labelKey)}</span>
              <p className={styles.body}>{t(bodyKey)}</p>
            </ScrollReveal>
          ))}

          <ScrollReveal className={styles.stanza}>
            <span className={styles.label} aria-hidden="true" />
            <div className={styles.sign}>
              <p className={styles.signTitle}>{t('about.next.title')}</p>
              <p className={styles.signBody}>{t('about.next.body')}</p>
              <Link to="/why-it-works" className={styles.signLink}>
                {t('about.next.link')}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      <CtaBand tone="moss" />
    </>
  )
}

export default AboutPage
