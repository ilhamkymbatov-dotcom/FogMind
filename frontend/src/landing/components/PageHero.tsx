import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useTranslation, type TranslationKey } from '../../i18n'
import { Container } from './Container'
import { Eyebrow, type EyebrowTone } from './Eyebrow'
import { ScrollReveal } from './motion/ScrollReveal'
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

  const inner = (
    <ScrollReveal>
      <div className={styles.inner}>
        {eyebrowKey ? <Eyebrow labelKey={eyebrowKey} tone={tone} /> : null}
        <h1 className={styles.title}>{t(titleKey)}</h1>
        <p className={styles.subtitle}>{t(subtitleKey)}</p>
      </div>
    </ScrollReveal>
  )

  return (
    <section ref={ref} className={[styles.hero, styles[tone]].join(' ')}>
      <Container>
        {reduced ? inner : <motion.div style={{ y, opacity, scale }}>{inner}</motion.div>}
      </Container>
    </section>
  )
}
