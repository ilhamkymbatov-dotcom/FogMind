import { ArrowRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation, type TranslationKey } from '../../i18n'
import { Container } from '../components/Container'
import { CtaBand } from '../components/CtaBand'
import { PageHero } from '../components/PageHero'
import { ScrollReveal } from '../components/motion/ScrollReveal'
import styles from './FaqPage.module.css'

/*
 * Questions owns the practical answers and nothing conceptual. Everything here
 * describes what the product actually does today: the formats it reads, where
 * the material goes, what is stored and what it costs. The reasoning lives on
 * Why it works and the process lives on How it works.
 *
 * The shape is a grouped list of native disclosures. Using details and summary
 * means the open and close behaviour, the keyboard handling and find in page
 * all come from the browser rather than from bespoke state.
 */

interface GroupSpec {
  titleKey: TranslationKey
  items: readonly { qKey: TranslationKey; aKey: TranslationKey }[]
}

const GROUPS: readonly GroupSpec[] = [
  {
    titleKey: 'faq.g1',
    items: [
      { qKey: 'faq.q1', aKey: 'faq.a1' },
      { qKey: 'faq.q2', aKey: 'faq.a2' },
      { qKey: 'faq.q3', aKey: 'faq.a3' },
    ],
  },
  {
    titleKey: 'faq.g2',
    items: [
      { qKey: 'faq.q4', aKey: 'faq.a4' },
      { qKey: 'faq.q5', aKey: 'faq.a5' },
      { qKey: 'faq.q6', aKey: 'faq.a6' },
    ],
  },
  {
    titleKey: 'faq.g3',
    items: [
      { qKey: 'faq.q7', aKey: 'faq.a7' },
      { qKey: 'faq.q8', aKey: 'faq.a8' },
    ],
  },
]

function FaqPage() {
  const { t } = useTranslation()

  return (
    <>
      <PageHero
        eyebrowKey="faq.hero.eyebrow"
        titleKey="faq.hero.title"
        subtitleKey="faq.hero.subtitle"
        tone="moss"
      />

      <section className={styles.answers}>
        <Container>
          {GROUPS.map(({ titleKey, items }, groupIndex) => (
            <ScrollReveal key={titleKey} delay={0.03} className={styles.group}>
              <h2 className={styles.groupTitle}>
                <span className={styles.groupIndex} aria-hidden="true">{`0${groupIndex + 1}`}</span>
                {t(titleKey)}
              </h2>

              <div className={styles.items}>
                {items.map(({ qKey, aKey }) => (
                  <details key={qKey} className={styles.item}>
                    <summary className={styles.question}>
                      <span className={styles.questionText}>{t(qKey)}</span>
                      <Plus size={18} aria-hidden="true" className={styles.marker} />
                    </summary>
                    <p className={styles.answer}>{t(aKey)}</p>
                  </details>
                ))}
              </div>
            </ScrollReveal>
          ))}
        </Container>
      </section>

      <section className={styles.next}>
        <Container>
          <ScrollReveal>
            <p className={styles.nextNote}>
              <span className={styles.nextTitle}>{t('faq.next.title')}</span>
              <span className={styles.nextBody}>{t('faq.next.body')}</span>
              <Link to="/how-it-works" className={styles.nextLink}>
                {t('faq.next.link')}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </p>
          </ScrollReveal>
        </Container>
      </section>

      <CtaBand tone="ink" />
    </>
  )
}

export default FaqPage
