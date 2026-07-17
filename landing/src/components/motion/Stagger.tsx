import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from './useMediaQuery'

export const EASE_OUT = [0.22, 1, 0.36, 1] as const

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
}

interface StaggerProps {
  children: ReactNode
  className?: string
}

/**
 * Reveals its StaggerItem descendants in sequence when scrolled into view.
 * Variants propagate through plain elements, so items can sit anywhere in the
 * subtree. Under reduced motion both render static, fully visible content.
 */
export function Stagger({ children, className }: StaggerProps) {
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-64px 0px' }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: StaggerProps) {
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  )
}
