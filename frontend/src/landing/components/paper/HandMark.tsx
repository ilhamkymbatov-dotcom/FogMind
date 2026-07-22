import { motion } from 'framer-motion'
import { useStaticReveal } from '../motion/Surface'
import styles from './HandMark.module.css'

/*
 * Marginalia: pen marks a person would leave on a page.
 *
 * The paths are hand authored and deliberately uneven. An underline sags and
 * lifts and overshoots its phrase, a circle does not close and rides past where
 * it started, an arrow bends and its head is two separate short strokes. None
 * of it is generated from a formula, because a sampled curve reads as a machine
 * however much noise is added to it.
 *
 * These are bespoke generated geometry rather than iconography, so they are
 * drawn with SVG primitives. The icon rule, lucide only and no pasted icon
 * artwork, is untouched.
 */

type MarkKind = 'underline' | 'circle' | 'arrow'

interface Spec {
  viewBox: string
  /** One entry per stroke, so a mark can be drawn in more than one pass. */
  paths: readonly string[]
  ratio: string
}

const MARKS: Record<MarkKind, Spec> = {
  // Sags in the middle, lifts at the end, and runs past the last letter.
  underline: {
    viewBox: '0 0 200 12',
    ratio: 'none',
    paths: [
      'M2.4 7.6 C24 5.4 46 8.9 68 7.2 C90 5.5 112 8.6 134 6.8 C156 5.1 176 8.4 198 5.6',
      'M9.8 10.1 C32 8.6 58 10.8 84 9.4',
    ],
  },
  // Never closes: it overshoots the start the way a real pen does.
  circle: {
    viewBox: '0 0 120 62',
    ratio: 'xMidYMid meet',
    paths: [
      'M96 14.5 C86 7.2 62 4.4 42 7.8 C20 11.6 6 24.2 8.6 37.4 C11.2 50.1 32 57.2 55 55.4 ' +
        'C77 53.7 96 44.8 98.6 32.6 C100.7 22.6 92 12.4 74 8.2',
    ],
  },
  // A bent shaft, then two short strokes for the head.
  arrow: {
    viewBox: '0 0 120 84',
    ratio: 'xMidYMid meet',
    paths: ['M10 7 C34 24 46 47 62 70', 'M62 70 C57 63 52 59 46 56', 'M62 70 C62 62 63 55 66 48'],
  },
}

interface HandMarkProps {
  kind: MarkKind
  className?: string
  /** Any CSS colour. Defaults to the warm accent through currentColor. */
  color?: string
  strokeWidth?: number
  delay?: number
}

export function HandMark({ kind, className, color, strokeWidth = 2.2, delay = 0 }: HandMarkProps) {
  const spec = MARKS[kind]
  const isStatic = useStaticReveal()

  return (
    <span className={[styles.mark, className].filter(Boolean).join(' ')} aria-hidden="true">
      <svg viewBox={spec.viewBox} preserveAspectRatio={spec.ratio} className={styles.svg}>
        {spec.paths.map((d, i) =>
          isStatic ? (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={color ?? 'currentColor'}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          ) : (
            <motion.path
              key={i}
              d={d}
              fill="none"
              stroke={color ?? 'currentColor'}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: false, margin: '-12% 0px -16% 0px' }}
              transition={{
                pathLength: { duration: 0.62, delay: delay + i * 0.16, ease: [0.4, 0.1, 0.2, 1] },
                opacity: { duration: 0.12, delay: delay + i * 0.16 },
              }}
            />
          ),
        )}
      </svg>
    </span>
  )
}
