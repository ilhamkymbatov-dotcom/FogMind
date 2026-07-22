import { useCanvasScene, TONE_RGB, type SceneTone } from './useCanvasScene'
import styles from './SectionBackdrop.module.css'

/*
 * The four living section backgrounds. Each one is tinted to the wash it sits
 * on and painted at a very low alpha, so it reads as atmosphere rather than as
 * a picture.
 *
 * The alphas are budgeted, not guessed. Muted body text on the tightest wash
 * (ink) stops clearing 4.5:1 once a backdrop covers about 0.09, so every effect
 * is kept under that with its own worst case stacking counted: mist and ink
 * assume three overlapping cores. The constellation is the awkward one, because
 * several links converging on a dot composite together, so on top of low source
 * alphas it carries a hard opacity ceiling and the result is measured off the
 * real canvas rather than reasoned about. The light sweep brightens rather than
 * darkens, which only helps dark text.
 *
 * All four share one canvas runner, so all four pause offscreen and when the
 * tab is hidden, and all four fall back to a single settled frame under reduced
 * motion rather than an empty box.
 */

interface BackdropProps {
  tone: SceneTone
  /** Overall strength, for sections that want even less presence. */
  strength?: number
}

/* Mist ---------------------------------------------------------------------- */

const MIST_BLOBS = [
  { x: 0.18, y: 0.3, r: 0.5, sx: 0.013, sy: 0.006, phase: 0 },
  { x: 0.72, y: 0.24, r: 0.55, sx: -0.009, sy: 0.008, phase: 1.7 },
  { x: 0.46, y: 0.72, r: 0.6, sx: 0.007, sy: -0.01, phase: 3.1 },
  { x: 0.88, y: 0.66, r: 0.44, sx: -0.012, sy: -0.005, phase: 4.6 },
]

/** Drifting mist, the fog the learner is clearing, at a whisper. */
export function MistBackdrop({ tone, strength = 1 }: BackdropProps) {
  const rgb = TONE_RGB[tone]
  const ref = useCanvasScene((ctx, w, h, t) => {
    const long = Math.max(w, h)
    for (const b of MIST_BLOBS) {
      const cx = (((b.x + b.sx * t) % 1) + 1) % 1
      const cy = (((b.y + b.sy * t) % 1) + 1) % 1
      const breathe = 1 + Math.sin(t * 0.12 + b.phase) * 0.12
      const r = b.r * long * breathe
      const x = cx * w
      const y = cy * h
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(${rgb}, ${0.025 * strength})`)
      g.addColorStop(0.55, `rgba(${rgb}, ${0.011 * strength})`)
      g.addColorStop(1, `rgba(${rgb}, 0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  return <canvas ref={ref} className={styles.canvas} aria-hidden="true" />
}

/* Constellation -------------------------------------------------------------- */

interface Star {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

/**
 * A faint field of nodes with thin links between near neighbours. Because the
 * nodes drift, links form and dissolve on their own as distances cross the
 * threshold, which is the effect asked for without scripting it.
 */
export function ConstellationBackdrop({ tone, strength = 1 }: BackdropProps) {
  const rgb = TONE_RGB[tone]
  const stars: Star[] = []

  const ref = useCanvasScene((ctx, w, h, t) => {
    if (stars.length === 0) {
      // Density scales with area so a tall section is not sparse.
      const count = Math.min(34, Math.max(12, Math.round((w * h) / 42000)))
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random(),
          y: Math.random(),
          vx: (Math.random() - 0.5) * 0.006,
          vy: (Math.random() - 0.5) * 0.006,
          r: 1.3 + Math.random() * 1.4,
        })
      }
    }

    const pts = stars.map((s) => ({
      x: (((s.x + s.vx * t) % 1) + 1) % 1 * w,
      y: (((s.y + s.vy * t) % 1) + 1) % 1 * h,
      r: s.r,
    }))

    const linkDist = Math.min(w, h) * 0.28
    ctx.lineWidth = 1
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x
        const dy = pts[i].y - pts[j].y
        const d = Math.hypot(dx, dy)
        if (d > linkDist) continue
        // Fades to nothing exactly at the threshold, so links appear and
        // disappear smoothly rather than blinking.
        const a = (1 - d / linkDist) * 0.028 * strength
        ctx.strokeStyle = `rgba(${rgb}, ${a})`
        ctx.beginPath()
        ctx.moveTo(pts[i].x, pts[i].y)
        ctx.lineTo(pts[j].x, pts[j].y)
        ctx.stroke()
      }
    }

    ctx.fillStyle = `rgba(${rgb}, ${0.05 * strength})`
    for (const p of pts) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  return <canvas ref={ref} className={[styles.canvas, styles.constellation].join(' ')} aria-hidden="true" />
}

/* Light sweep ---------------------------------------------------------------- */

/*
 * Motes hanging in the shaft. Fixed positions with their own slow drift and
 * breathing phase, so they never march in step. They only show where the light
 * actually is, which is what makes them read as dust rather than as stars.
 */
const MOTES = Array.from({ length: 26 }, (_, i) => {
  const golden = 0.618033988749895
  return {
    x: ((i * golden) % 1),
    y: ((i * 0.4142 + 0.17) % 1),
    r: 0.7 + ((i * 7) % 5) * 0.32,
    drift: 0.004 + ((i * 3) % 7) * 0.0016,
    sway: 0.012 + ((i * 5) % 6) * 0.004,
    phase: (i * 1.37) % 6.283,
  }
})

/** A soft shaft of light crossing the section, like light over a desk. */
export function LightSweepBackdrop({ tone, strength = 1 }: BackdropProps) {
  const rgb = TONE_RGB[tone]
  const ref = useCanvasScene(
    (ctx, w, h, t) => {
      // One slow pass roughly every 26 seconds, with a long dark gap between.
      const cycle = 26
      const p = ((t % cycle) + cycle) % cycle / cycle
      const centre = -0.35 + p * 1.7
      const band = 0.42

      const x0 = (centre - band) * w
      const x1 = (centre + band) * w
      const g = ctx.createLinearGradient(x0, 0, x1, h)
      g.addColorStop(0, `rgba(255, 255, 255, 0)`)
      g.addColorStop(0.5, `rgba(255, 255, 255, ${0.5 * strength})`)
      g.addColorStop(1, `rgba(255, 255, 255, 0)`)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      // A faint tinted edge trailing the light, so it belongs to the section.
      const g2 = ctx.createLinearGradient(x0, 0, x1, h)
      g2.addColorStop(0, `rgba(${rgb}, 0)`)
      g2.addColorStop(0.5, `rgba(${rgb}, ${0.03 * strength})`)
      g2.addColorStop(1, `rgba(${rgb}, 0)`)
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, w, h)

      // Dust, lit only while the shaft is passing over it.
      for (const m of MOTES) {
        const mx = ((m.x + Math.sin(t * m.sway + m.phase) * 0.02 + 1) % 1) * w
        const my = (((m.y - m.drift * t) % 1) + 1) % 1 * h
        // Distance from the centre of the shaft, in fractions of the width.
        const lit = 1 - Math.min(1, Math.abs(mx / w - centre) / band)
        if (lit <= 0) continue
        const twinkle = 0.6 + Math.sin(t * 0.8 + m.phase) * 0.4
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * lit * twinkle * strength})`
        ctx.beginPath()
        ctx.arc(mx, my, m.r, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    { staticAt: 6.5 },
  )

  return <canvas ref={ref} className={styles.canvas} aria-hidden="true" />
}

/* Ink diffusion --------------------------------------------------------------- */

const INK_POOLS = [
  { x: 0.24, y: 0.34, r: 0.42, speed: 0.055, phase: 0 },
  { x: 0.68, y: 0.6, r: 0.5, speed: 0.041, phase: 2.2 },
  { x: 0.5, y: 0.14, r: 0.36, speed: 0.033, phase: 4.1 },
]

/** Tinted colour soaking outward and back, like ink spreading into paper. */
export function InkBackdrop({ tone, strength = 1 }: BackdropProps) {
  const rgb = TONE_RGB[tone]
  const ref = useCanvasScene((ctx, w, h, t) => {
    const long = Math.max(w, h)
    for (const pool of INK_POOLS) {
      // Soaks out and draws back, never fully gone and never fully spread.
      const swell = 0.72 + (Math.sin(t * pool.speed + pool.phase) + 1) / 2 * 0.5
      const r = pool.r * long * swell
      const x = pool.x * w
      const y = pool.y * h
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(${rgb}, ${0.022 * strength})`)
      g.addColorStop(0.6, `rgba(${rgb}, ${0.009 * strength})`)
      g.addColorStop(1, `rgba(${rgb}, 0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  return <canvas ref={ref} className={styles.canvas} aria-hidden="true" />
}
