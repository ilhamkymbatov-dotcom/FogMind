import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useStaticReveal } from '../motion/Surface'
import styles from './BookmarkRibbon.module.css'

/**
 * A ribbon marking the reader's place, hung from the top of a section.
 *
 * It slides a little as the section passes, the way a ribbon shifts when a book
 * is handled. The travel is small and driven by scroll position rather than a
 * trigger, so it is always exactly where the reading is. With motion off it
 * hangs at a fixed length.
 */
export function BookmarkRibbon({ tone = 'moss' }: { tone?: 'moss' | 'plum' | 'ink' | 'sand' }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isStatic = useStaticReveal()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const eased = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.5 })
  const y = useTransform(eased, [0, 1], [-10, 16])

  return (
    <span ref={ref} className={[styles.hanger, styles[tone]].join(' ')} aria-hidden="true">
      {isStatic ? (
        <span className={styles.ribbon} />
      ) : (
        <motion.span className={styles.ribbon} style={{ y }} />
      )}
    </span>
  )
}
