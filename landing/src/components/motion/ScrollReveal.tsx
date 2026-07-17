import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

export interface ScrollRevealProps {
  children: ReactNode
  /** Seconds to wait before the reveal starts, for staggering siblings. */
  delay?: number
  className?: string
}

/**
 * Fades and slides its content up when it first scrolls into view.
 *
 * With prefers-reduced-motion the content renders static: no fade either,
 * since an opacity: 0 initial state would leave content invisible if the
 * animation never runs.
 */
export function ScrollReveal({ children, delay = 0, className }: ScrollRevealProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-64px 0px' }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}
