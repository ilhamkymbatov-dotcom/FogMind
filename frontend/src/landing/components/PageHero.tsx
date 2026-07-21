import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useTranslation, type TranslationKey } from '../../i18n'
import { Container } from './Container'
import { Eyebrow, type EyebrowTone } from './Eyebrow'
import { SurfaceGroup, SurfaceItem } from './motion/Surface'
import { usePrefersReducedMotion } from './motion/useMediaQuery'
import styles from './PageHero.module.css'

export interface PageHeroProps {
  titleKey: TranslationKey
  subtitleKey: TranslationKey
  /** Small label above the title, announcing the section. */
  eyebrowKey?: TranslationKey
  /** The hue this page runs on, tinting the eyebrow and the hero wash. */
  tone?: EyebrowTone
}

/**
 * The opening section of a content page: a large centered title and one line.
 * As the user scrolls past, the text gently lifts, shrinks and fades, which
 * gives the page depth without touching layout.
 */
export function PageHero({ titleKey, subtitleKey, eyebrowKey, tone = 'warm' }: PageHeroProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, -36])
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.98])

  // The opening builds itself: label, then headline, then the line under it.
  const inner = (
    <SurfaceGroup className={styles.inner} stagger={0.1} reversible={false}>
      {eyebrowKey ? (
        <SurfaceItem from="below" distance={18} blur={0}>
          <Eyebrow labelKey={eyebrowKey} tone={tone} />
        </SurfaceItem>
      ) : null}
      <SurfaceItem from="below" distance={34} blur={6}>
        <h1 className={styles.title}>{t(titleKey)}</h1>
      </SurfaceItem>
      <SurfaceItem from="below" distance={24} blur={3}>
        <p className={styles.subtitle}>{t(subtitleKey)}</p>
      </SurfaceItem>
    </SurfaceGroup>
  )

  return (
    <section ref={ref} className={[styles.hero, styles[tone]].join(' ')}>
      <Container>
        {reduced ? inner : <motion.div style={{ y, opacity, scale }}>{inner}</motion.div>}
      </Container>
    </section>
  )
}
