import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../motion/useMediaQuery'

export type SceneDraw = (ctx: CanvasRenderingContext2D, w: number, h: number, seconds: number) => void

interface SceneOptions {
  /** Frozen time used for the single static frame under reduced motion. */
  staticAt?: number
  /** Upper bound on device pixel ratio. Backgrounds are soft, so 1.5 is plenty. */
  maxDpr?: number
}

/**
 * Runs a canvas background that fills its parent.
 *
 * Three things every section background here needs, in one place:
 *
 *   Never empty. One frame is painted synchronously on mount and after every
 *   resize, so the element always shows something even before the loop starts,
 *   or if it never starts at all.
 *
 *   Never wasteful. The loop runs only while the section is on screen and the
 *   tab is visible; it stops on the way out and resumes on the way back.
 *
 *   Never moving when motion is off. With reduced motion the loop is not
 *   started and a single settled frame is drawn instead, so the section keeps
 *   its atmosphere without any animation.
 */
export function useCanvasScene(draw: SceneDraw, { staticAt = 8, maxDpr = 1.5 }: SceneOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef(draw)
  drawRef.current = draw
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let raf = 0
    let running = false
    let onScreen = false
    let start = 0

    const paint = (seconds: number) => {
      if (width === 0 || height === 0) return
      ctx.clearRect(0, 0, width, height)
      drawRef.current(ctx, width, height, seconds)
    }

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      width = Math.max(1, Math.round(rect.width))
      height = Math.max(1, Math.round(rect.height))
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Repaint immediately so a resize never leaves a blank frame.
      paint(reduced ? staticAt : (performance.now() - start) / 1000)
    }

    const frame = (now: number) => {
      paint((now - start) / 1000)
      if (running) raf = requestAnimationFrame(frame)
    }

    const startLoop = () => {
      if (running || reduced) return
      running = true
      if (start === 0) start = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const stopLoop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    start = performance.now()
    resize()

    const observer = new ResizeObserver(resize)
    observer.observe(parent)

    const visibility = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? false
        if (onScreen && !document.hidden) startLoop()
        else stopLoop()
      },
      { threshold: 0 },
    )
    visibility.observe(parent)

    const onVisibility = () => {
      if (document.hidden) stopLoop()
      else if (onScreen) startLoop()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stopLoop()
      observer.disconnect()
      visibility.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced, staticAt, maxDpr])

  return canvasRef
}

/** The section hues, as raw channels for canvas colour strings. */
export const TONE_RGB = {
  warm: '192, 102, 58',
  ink: '42, 58, 85',
  moss: '74, 92, 61',
  plum: '106, 66, 87',
  sand: '125, 95, 51',
} as const

export type SceneTone = keyof typeof TONE_RGB
