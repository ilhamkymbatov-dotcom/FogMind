import { useEffect, useRef } from 'react'
import { useCoarsePointer, usePrefersReducedMotion } from './motion/useMediaQuery'

interface TiltOptions {
  /** Maximum rotation of the scene, in degrees. */
  max?: number
  /** Base pixel shift for layers, multiplied by each layer's own depth. */
  shift?: number
}

const clamp = (v: number) => Math.max(-1, Math.min(1, v))

/**
 * Gentle pointer parallax for the hero.
 *
 * The returned ref goes on the scene. Any descendant carrying a
 * data-tilt-depth attribute shifts by that depth, so background, mid ground and
 * foreground travel at different rates and the hero reads as layered space
 * rather than a flat picture.
 *
 * Transforms are written straight to the DOM inside a requestAnimationFrame and
 * eased toward the target, so the motion stays smooth and moving the pointer
 * never triggers a React render. The loop stops once it settles. Touch pointers
 * and reduced motion opt out entirely.
 */
export function usePointerTilt({ max = 5, shift = 12 }: TiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const coarse = useCoarsePointer()

  useEffect(() => {
    if (reduced || coarse) return
    const scene = ref.current
    if (!scene) return

    const layers = Array.from(scene.querySelectorAll<HTMLElement>('[data-tilt-depth]'))
    let raf = 0
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }

    const apply = () => {
      current.x += (target.x - current.x) * 0.08
      current.y += (target.y - current.y) * 0.08

      scene.style.transform = `perspective(1200px) rotateX(${(-current.y * max).toFixed(3)}deg) rotateY(${(current.x * max).toFixed(3)}deg)`
      for (const layer of layers) {
        const depth = Number(layer.dataset.tiltDepth ?? 0)
        const dx = (current.x * shift * depth).toFixed(2)
        const dy = (current.y * shift * depth).toFixed(2)
        layer.style.transform = `translate3d(${dx}px, ${dy}px, 0)`
      }

      if (Math.abs(target.x - current.x) > 0.0008 || Math.abs(target.y - current.y) > 0.0008) {
        raf = requestAnimationFrame(apply)
      } else {
        raf = 0
      }
    }

    const kick = () => {
      if (raf === 0) raf = requestAnimationFrame(apply)
    }

    const onMove = (event: PointerEvent) => {
      const rect = scene.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      target.x = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2)
      target.y = clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2)
      kick()
    }

    const recentre = () => {
      target.x = 0
      target.y = 0
      kick()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('blur', recentre)
    document.addEventListener('pointerleave', recentre)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('blur', recentre)
      document.removeEventListener('pointerleave', recentre)
      cancelAnimationFrame(raf)
      scene.style.transform = ''
      for (const layer of layers) layer.style.transform = ''
    }
  }, [reduced, coarse, max, shift])

  return ref
}
