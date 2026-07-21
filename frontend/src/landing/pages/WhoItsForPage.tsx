import { motion } from 'framer-motion'
import { BookOpen, Briefcase, GraduationCap, Library, Target, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation, type TranslationKey } from '../../i18n'
import { Container } from '../components/Container'
import { CtaBand } from '../components/CtaBand'
import { PageHero } from '../components/PageHero'
import { Surface } from '../components/motion/Surface'
import { MistBackdrop } from '../components/fx/SectionBackdrop'
import { useStaticReveal } from '../components/motion/Surface'
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

/**
 * The page's signature: each entry is dealt onto the page like a card being laid
 * on a desk. It arrives from alternating sides, tilted and lifted, then settles
 * flat. Dealing again on the way back up keeps the register feeling handled
 * rather than printed.
 */
function DeskEntry({ index, children }: { index: number; children: React.ReactNode }) {
  const reduced = useStaticReveal()
  if (reduced) return <div className={styles.entry}>{children}</div>

  const side = index % 2 === 0 ? -1 : 1

  return (
    <motion.div
      className={styles.entry}
      initial={{ opacity: 0, x: side * 110, y: 26, rotate: side * 2.6, scale: 0.95, filter: 'blur(5px)' }}
      whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: false, margin: '-10% 0px -14% 0px' }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1100 }}
    >
      {children}
    </motion.div>
  )
}

function Directory() {
  const { t } = useTranslation()

  return (
    <section className={styles.directory}>
      <MistBackdrop tone="plum" />
      <Container className={styles.layer}>
        <ol className={styles.list}>
          {PROFILES.map(({ icon: Icon, roleKey, whenKey, situationKey, outcomeKey }, index) => (
            <li key={roleKey}>
              <DeskEntry index={index}>
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
              </DeskEntry>
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
        <Surface from="below" distance={56}>
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
        </Surface>
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
