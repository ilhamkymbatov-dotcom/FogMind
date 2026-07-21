import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { EASE_SURFACE } from './Surface'
import { usePrefersReducedMotion } from './useMediaQuery'

/**
 * Fades, lifts and very slightly scales the routed page in on navigation.
 *
 * Rendered once, in AnimatedRoutes, keyed by pathname so it remounts per
 * route. Enter only by design, see the comment in AnimatedRoutes. Pages must
 * not wrap themselves in it, or transitions run twice.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduceMotion = usePrefersReducedMotion()

  if (reduceMotion) {
    return <div>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.992 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: EASE_SURFACE }}
    >
      {children}
    </motion.div>
  )
}
