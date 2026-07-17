import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { usePrefersReducedMotion } from './useMediaQuery'

interface ParallaxProps {
  children: ReactNode
  className?: string
  /** Total vertical travel in px across the element's time on screen. */
  amount?: number
}

/**
 * Moves its content at a slightly different rate than the page while it
 * crosses the viewport. Transform only, so it stays off the layout thread.
 */
export function Parallax({ children, className, amount = 14 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount])

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  )
}
