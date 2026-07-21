import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { ReactNode } from 'react'
import { useCoarsePointer, usePrefersReducedMotion } from './useMediaQuery'

interface TiltCardProps {
  children: ReactNode
  className?: string
  /** Maximum tilt in degrees. */
  max?: number
}

/**
 * A card that leans toward the pointer and lifts slightly while hovered, then
 * springs flat when it leaves. Motion values are written directly, so moving
 * the pointer never triggers a React render.
 *
 * Touch gets a press response instead of a tilt, since there is no hover there,
 * and reduced motion gets a plain element.
 */
export function TiltCard({ children, className, max = 6 }: TiltCardProps) {
  const reduced = usePrefersReducedMotion()
  const coarse = useCoarsePointer()

  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const spring = { stiffness: 260, damping: 26, mass: 0.4 }
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), spring)
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), spring)

  if (reduced) return <div className={className}>{children}</div>

  if (coarse) {
    return (
      <motion.div className={className} whileTap={{ scale: 0.985 }} transition={spring}>
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: 'preserve-3d' }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
      transition={spring}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        px.set((event.clientX - rect.left) / rect.width - 0.5)
        py.set((event.clientY - rect.top) / rect.height - 0.5)
      }}
      onPointerLeave={() => {
        px.set(0)
        py.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}
