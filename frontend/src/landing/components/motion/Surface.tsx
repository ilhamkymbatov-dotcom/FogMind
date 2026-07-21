import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from './useMediaQuery'

export const EASE_SURFACE = [0.22, 1, 0.36, 1] as const

/*
 * Scroll triggered reveals rely on IntersectionObserver. If it is missing the
 * observer never reports, the element never leaves its hidden start state and
 * the content is invisible with no way back. Rather than risk that, treat a
 * missing observer exactly like reduced motion and render the finished state.
 */
const SUPPORTS_IN_VIEW = typeof window !== 'undefined' && 'IntersectionObserver' in window

/** True when a reveal should be skipped and the final state rendered outright. */
export function useStaticReveal(): boolean {
  const reduced = usePrefersReducedMotion()
  return reduced || !SUPPORTS_IN_VIEW
}

/** Which edge the element travels in from. */
export type From = 'left' | 'right' | 'below' | 'none'

interface SurfaceProps {
  children: ReactNode
  from?: From
  /** Travel distance in pixels. Large values read as arriving from offscreen. */
  distance?: number
  delay?: number
  /** Starting blur. Set to 0 on large or text heavy blocks to keep paint cheap. */
  blur?: number
  /** How far back in depth it starts, in pixels. */
  depth?: number
  className?: string
  /** Seconds. Raise it for a slower, more editorial settle. */
  duration?: number
  /** Leave true to keep the reveal reversible as the reader scrolls back up. */
  reversible?: boolean
}

function offsets(from: From, distance: number) {
  if (from === 'left') return { x: -distance, y: 0 }
  if (from === 'right') return { x: distance, y: 0 }
  if (from === 'below') return { x: 0, y: distance }
  return { x: 0, y: 0 }
}

/**
 * The site's arrival motion: an element starts pushed back in depth, slightly
 * small, softly blurred and offset to one side, then rises forward into focus
 * as it enters the viewport. The intent is surfacing out of fog rather than
 * sliding in, which is why depth and blur move together with the offset.
 *
 * Reversible by default, so scrolling back up returns elements to their
 * submerged state and the page reads as alive in both directions. Under reduced
 * motion nothing animates and the content renders in its final visible state.
 */
export function Surface({
  children,
  from = 'below',
  distance = 48,
  delay = 0,
  blur = 5,
  depth = 70,
  className,
  duration = 0.78,
  reversible = true,
}: SurfaceProps) {
  const isStatic = useStaticReveal()
  if (isStatic) return <div className={className}>{children}</div>

  const { x, y } = offsets(from, distance)

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y, scale: 0.94, z: -depth, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, z: 0, filter: 'blur(0px)' }}
      viewport={{ once: !reversible, margin: '-8% 0px -12% 0px' }}
      transition={{ duration, delay, ease: EASE_SURFACE }}
      style={{ transformPerspective: 1200, willChange: 'transform, opacity, filter' }}
    >
      {children}
    </motion.div>
  )
}

/* Staggered groups ------------------------------------------------------------ */

interface GroupProps {
  children: ReactNode
  className?: string
  /** Seconds between each child arriving. */
  stagger?: number
  delay?: number
  reversible?: boolean
}

const groupVariants = (stagger: number, delay: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
})

/**
 * Sequences its SurfaceItem descendants so a section builds itself in front of
 * the reader instead of appearing at once. Variants propagate through plain
 * elements, so items can sit anywhere in the subtree.
 */
export function SurfaceGroup({
  children,
  className,
  stagger = 0.09,
  delay = 0,
  reversible = true,
}: GroupProps) {
  const isStatic = useStaticReveal()
  if (isStatic) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      variants={groupVariants(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: !reversible, margin: '-6% 0px -10% 0px' }}
    >
      {children}
    </motion.div>
  )
}

interface ItemProps {
  children: ReactNode
  from?: From
  distance?: number
  blur?: number
  depth?: number
  className?: string
}

export function SurfaceItem({
  children,
  from = 'below',
  distance = 40,
  blur = 4,
  depth = 60,
  className,
}: ItemProps) {
  const isStatic = useStaticReveal()
  if (isStatic) return <div className={className}>{children}</div>

  const { x, y } = offsets(from, distance)

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, x, y, scale: 0.95, z: -depth, filter: `blur(${blur}px)` },
        show: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          z: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.72, ease: EASE_SURFACE },
        },
      }}
      style={{ transformPerspective: 1200 }}
    >
      {children}
    </motion.div>
  )
}
