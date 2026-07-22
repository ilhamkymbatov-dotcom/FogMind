import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation, type TranslationKey } from '../../i18n'
import { Container } from '../components/Container'
import { CtaBand } from '../components/CtaBand'
import { PageHero } from '../components/PageHero'
import { Surface, SurfaceGroup, SurfaceItem } from '../components/motion/Surface'
import { ConstellationBackdrop } from '../components/fx/SectionBackdrop'
import { BookmarkRibbon } from '../components/paper/BookmarkRibbon'
import { usePrefersReducedMotion } from '../components/motion/useMediaQuery'
import styles from './FaqPage.module.css'

/*
 * Questions owns the practical answers and nothing conceptual. Everything here
 * describes what the product actually does today: the formats it reads, where
 * the material goes, what is stored and what it costs. The reasoning lives on
 * Why it works and the process lives on How it works.
 *
 * The shape is a grouped list of disclosures. They are controlled rather than
 * native, because a details element cannot animate its own height, and this
 * page's signature is the calm open and close. The accessible contract is kept
 * by hand: a real button with aria expanded and aria controls, and a labelled
 * region holding the answer.
 */

/** One disclosure. Opens and closes by animating its own measured height. */
function Item({ qKey, aKey }: { qKey: TranslationKey; aKey: TranslationKey }) {
  const { t } = useTranslation()
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div className={[styles.item, open ? styles.itemOpen : ''].filter(Boolean).join(' ')}>
      <button
        type="button"
        className={styles.question}
        aria-expanded={open}
        aria-controls={`${id}-answer`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.questionText}>{t(qKey)}</span>
        <Plus size={18} aria-hidden="true" className={styles.marker} />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={`${id}-answer`}
            role="region"
            className={styles.answerWrap}
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={reduced ? undefined : { height: 'auto', opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.22, ease: 'linear' },
            }}
          >
            <p className={styles.answer}>{t(aKey)}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

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
        <ConstellationBackdrop tone="moss" />
        <BookmarkRibbon tone="moss" />
        <Container className={styles.layer}>
          {GROUPS.map(({ titleKey, items }, groupIndex) => (
            <div key={titleKey} className={styles.group}>
              <Surface from="left" distance={46} blur={0}>
                <h2 className={styles.groupTitle}>
                  <span className={styles.groupIndex} aria-hidden="true">{`0${groupIndex + 1}`}</span>
                  {t(titleKey)}
                </h2>
              </Surface>

              {/* Questions arrive one after another rather than all at once. */}
              <SurfaceGroup className={styles.items} stagger={0.08}>
                {items.map(({ qKey, aKey }) => (
                  <SurfaceItem key={qKey} from="right" distance={54} blur={3}>
                    <Item qKey={qKey} aKey={aKey} />
                  </SurfaceItem>
                ))}
              </SurfaceGroup>
            </div>
          ))}
        </Container>
      </section>

      <section className={styles.next}>
        <Container>
          <Surface from="below" distance={40}>
            <p className={styles.nextNote}>
              <span className={styles.nextTitle}>{t('faq.next.title')}</span>
              <span className={styles.nextBody}>{t('faq.next.body')}</span>
              <Link to="/how-it-works" className={styles.nextLink}>
                {t('faq.next.link')}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </p>
          </Surface>
        </Container>
      </section>

      <CtaBand tone="ink" />
    </>
  )
}

export default FaqPage
