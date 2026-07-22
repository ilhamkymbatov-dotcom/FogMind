import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation, type TranslationKey } from '../../i18n'
import { Container } from '../components/Container'
import { CtaBand } from '../components/CtaBand'
import { PageHero } from '../components/PageHero'
import { Surface } from '../components/motion/Surface'
import { InkBackdrop } from '../components/fx/SectionBackdrop'
import { PaperGrain } from '../components/paper/PaperGrain'
import { Highlighter } from '../components/paper/Highlighter'
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
        <PaperGrain />
        <Container className={styles.layer}>
          {before.map(({ labelKey, bodyKey }) => (
            <div key={labelKey} className={styles.stanza}>
              <Surface from="left" distance={34} blur={0} duration={0.9}>
                <span className={styles.label}>{t(labelKey)}</span>
              </Surface>
              <Surface from="below" distance={26} blur={3} delay={0.16} duration={1.05}>
                <p className={styles.body}>{t(bodyKey)}</p>
              </Surface>
            </div>
          ))}
        </Container>
      </section>

      <section className={styles.pullBand}>
        <InkBackdrop tone="warm" />
        <Container className={styles.layer}>
          <Surface from="left" distance={64} blur={6} duration={1.15}>
            <p className={styles.pull}>
              <Highlighter text={t('about.pull')} phrase={t('about.pull.mark')} delay={0.3} />
            </p>
          </Surface>
        </Container>
      </section>

      <section className={styles.manifestoLower}>
        <PaperGrain />
        <Container className={styles.layer}>
          {after.map(({ labelKey, bodyKey }) => (
            <div key={labelKey} className={styles.stanza}>
              <Surface from="left" distance={34} blur={0} duration={0.9}>
                <span className={styles.label}>{t(labelKey)}</span>
              </Surface>
              <Surface from="below" distance={26} blur={3} delay={0.16} duration={1.05}>
                <p className={styles.body}>{t(bodyKey)}</p>
              </Surface>
            </div>
          ))}

          <div className={styles.stanza}>
            <span className={styles.label} aria-hidden="true" />
            <Surface from="below" distance={30} duration={1} className={styles.sign}>
              <p className={styles.signTitle}>{t('about.next.title')}</p>
              <p className={styles.signBody}>{t('about.next.body')}</p>
              <Link to="/why-it-works" className={styles.signLink}>
                {t('about.next.link')}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Surface>
          </div>
        </Container>
      </section>

      <CtaBand tone="moss" />
    </>
  )
}

export default AboutPage
