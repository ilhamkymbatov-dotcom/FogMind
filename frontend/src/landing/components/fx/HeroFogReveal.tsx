import { useEffect, useRef, type RefObject } from 'react'
import { useScroll } from 'framer-motion'
import { usePrefersReducedMotion } from '../motion/useMediaQuery'
import styles from './HeroFogReveal.module.css'

/*
 * Home's signature moment.
 *
 * The hero arrives under fog and the fog parts, clearing outward from the
 * centre to uncover the headline and the live map beneath it. Scrolling on
 * closes it again, so leaving the hero feels like walking back into the mist,
 * and scrolling up parts it a second time. That is the whole product metaphor
 * played once, at full size, before a word is read.
 *
 * Safety is deliberate here, because this layer sits above the headline. The
 * fog never reaches full opacity, so the text stays legible even mid reveal,
 * and a watchdog forces the layer clear if the reveal has not finished shortly
 * after mount. With reduced motion it renders nothing at all.
 */

const INTRO_MS = 1500
/* Below one, so the headline is never fully hidden at any point. */
const PEAK = 0.62
const FOG_RGB = '236, 231, 224'

const easeOut = (p: number) => 1 - Math.pow(1 - p, 3)

const BLOBS = [
  { x: 0.2, y: 0.34, r: 0.46, sx: 0.014, sy: 0.007 },
  { x: 0.74, y: 0.28, r: 0.5, sx: -0.011, sy: 0.009 },
  { x: 0.5, y: 0.7, r: 0.54, sx: 0.008, sy: -0.012 },
  { x: 0.9, y: 0.62, r: 0.4, sx: -0.015, sy: -0.006 },
]

export function HeroFogReveal({ targetRef }: { targetRef: RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start start', 'end start'] })
  const scrollRef = useRef(scrollYProgress)
  scrollRef.current = scrollYProgress

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    let raf = 0
    let running = true
    let mounted = 0
    let forceClear = false

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = Math.max(1, Math.round(rect.width))
      h = Math.max(1, Math.round(rect.height))
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const frame = (now: number) => {
      if (mounted === 0) mounted = now
      const t = (now - mounted) / 1000

      // How far the fog has parted: the intro opens it, scrolling closes it.
      const intro = forceClear ? 1 : easeOut(Math.min(1, (now - mounted) / INTRO_MS))
      const leaving = Math.min(1, scrollRef.current.get() * 1.5)
      const revealed = Math.max(0, intro - leaving)
      const density = (1 - revealed) * PEAK

      ctx.clearRect(0, 0, w, h)

      if (density > 0.002) {
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = `rgba(${FOG_RGB}, ${density})`
        ctx.fillRect(0, 0, w, h)

        // Texture, so the veil moves like weather rather than a flat sheet.
        const long = Math.max(w, h)
        for (const b of BLOBS) {
          const cx = ((((b.x + b.sx * t) % 1) + 1) % 1) * w
          const cy = ((((b.y + b.sy * t) % 1) + 1) % 1) * h
          const r = b.r * long
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
          g.addColorStop(0, `rgba(${FOG_RGB}, ${density * 0.5})`)
          g.addColorStop(1, `rgba(${FOG_RGB}, 0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(cx, cy, r, 0, Math.PI * 2)
          ctx.fill()
        }

        // The parting itself: a wide, very soft opening from the centre.
        if (revealed > 0) {
          const radius = revealed * Math.hypot(w, h) * 0.62
          ctx.globalCompositeOperation = 'destination-out'
          const clear = ctx.createRadialGradient(w / 2, h * 0.46, 0, w / 2, h * 0.46, radius)
          clear.addColorStop(0, 'rgba(0, 0, 0, 1)')
          clear.addColorStop(0.55, 'rgba(0, 0, 0, 0.82)')
          clear.addColorStop(1, 'rgba(0, 0, 0, 0)')
          ctx.fillStyle = clear
          ctx.beginPath()
          ctx.arc(w / 2, h * 0.46, radius, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalCompositeOperation = 'source-over'
        }
      }

      if (running) raf = requestAnimationFrame(frame)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(parent)
    raf = requestAnimationFrame(frame)

    // If anything stalls the loop, never leave the headline under fog.
    const watchdog = window.setTimeout(() => {
      forceClear = true
    }, INTRO_MS + 1800)

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (!running) {
        running = true
        forceClear = true
        raf = requestAnimationFrame(frame)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.clearTimeout(watchdog)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced])

  if (reduced) return null

  return <canvas ref={canvasRef} className={styles.fog} aria-hidden="true" />
}
