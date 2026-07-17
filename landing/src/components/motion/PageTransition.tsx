import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Fades and slides the routed page in on navigation.
 *
 * Rendered once, in AnimatedRoutes, keyed by pathname so it remounts per
 * route. Enter only by design, see the comment in AnimatedRoutes. Pages must
 * not wrap themselves in it, or transitions run twice.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
