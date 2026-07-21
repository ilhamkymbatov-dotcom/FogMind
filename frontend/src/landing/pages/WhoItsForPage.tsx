import { BookOpen, Briefcase, GraduationCap, Library, Target, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation, type TranslationKey } from '../../i18n'
import { Container } from '../components/Container'
import { CtaBand } from '../components/CtaBand'
import { PageHero } from '../components/PageHero'
import { ScrollReveal } from '../components/motion/ScrollReveal'
import styles from './WhoItsForPage.module.css'

/*
 * Who it is for owns the audiences and nothing else. No mechanics, no
 * capabilities: each entry is a person, a situation, and what changes for them.
 *
 * The shape is a directory of dossier entries separated by hairlines, three
 * columns to a row. Deliberately unlike the cinematic stage on Home, the
 * numbered rail on How it works and the gallery on Product.
 */

interface ProfileSpec {
  icon: typeof BookOpen
  roleKey: TranslationKey
  whenKey: TranslationKey
  situationKey: TranslationKey
  outcomeKey: TranslationKey
}

const PROFILES: readonly ProfileSpec[] = [
  {
    icon: BookOpen,
    roleKey: 'who.p1.role',
    whenKey: 'who.p1.when',
    situationKey: 'who.p1.situation',
    outcomeKey: 'who.p1.outcome',
  },
  {
    icon: GraduationCap,
    roleKey: 'who.p2.role',
    whenKey: 'who.p2.when',
    situationKey: 'who.p2.situation',
    outcomeKey: 'who.p2.outcome',
  },
  {
    icon: Target,
    roleKey: 'who.p3.role',
    whenKey: 'who.p3.when',
    situationKey: 'who.p3.situation',
    outcomeKey: 'who.p3.outcome',
  },
  {
    icon: Library,
    roleKey: 'who.p4.role',
    whenKey: 'who.p4.when',
    situationKey: 'who.p4.situation',
    outcomeKey: 'who.p4.outcome',
  },
  {
    icon: Briefcase,
    roleKey: 'who.p5.role',
    whenKey: 'who.p5.when',
    situationKey: 'who.p5.situation',
    outcomeKey: 'who.p5.outcome',
  },
]

function Directory() {
  const { t } = useTranslation()

  return (
    <section className={styles.directory}>
      <Container>
        <ol className={styles.list}>
          {PROFILES.map(({ icon: Icon, roleKey, whenKey, situationKey, outcomeKey }, index) => (
            <li key={roleKey}>
              <ScrollReveal delay={0.03} className={styles.entry}>
                <div className={styles.who}>
                  <span className={styles.index}>{`0${index + 1}`}</span>
                  <span className={styles.roleIcon}>
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className={styles.role}>{t(roleKey)}</span>
                </div>

                <div className={styles.story}>
                  <h2 className={styles.when}>{t(whenKey)}</h2>
                  <p className={styles.situation}>{t(situationKey)}</p>
                </div>

                <p className={styles.outcome}>{t(outcomeKey)}</p>
              </ScrollReveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}

/** Sends the reader to Product rather than describing capabilities here. */
function NextPage() {
  const { t } = useTranslation()

  return (
    <section className={styles.next}>
      <Container>
        <ScrollReveal>
          <Link to="/product" className={styles.nextBanner}>
            <span className={styles.nextText}>
              <span className={styles.nextTitle}>{t('who.next.title')}</span>
              <span className={styles.nextBody}>{t('who.next.body')}</span>
            </span>
            <span className={styles.nextLink}>
              {t('who.next.link')}
              <ArrowRight size={16} aria-hidden="true" />
            </span>
          </Link>
        </ScrollReveal>
      </Container>
    </section>
  )
}

function WhoItsForPage() {
  return (
    <>
      <PageHero
        eyebrowKey="who.hero.eyebrow"
        titleKey="who.hero.title"
        subtitleKey="who.hero.subtitle"
        tone="plum"
      />
      <Directory />
      <NextPage />
      <CtaBand tone="warm" />
    </>
  )
}

export default WhoItsForPage
