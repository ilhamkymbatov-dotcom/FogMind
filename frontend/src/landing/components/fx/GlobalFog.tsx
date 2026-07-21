import { useEffect, useRef } from 'react'
import { useCoarsePointer, usePrefersReducedMotion } from '../motion/useMediaQuery'
import styles from './GlobalFog.module.css'

/*
 * The site wide brand fog. One fixed, full viewport canvas lives in the app
 * shell, so it persists across route changes. A soft grayscale haze covers
 * everything, and the pointer wipes it clear as it moves, like mist on glass;
 * the wiped trail slowly heals behind you.
 *
 * How it renders: three low resolution buffers, composited into the visible
 * canvas as fog minus mask minus holes.
 *   fog buffer    the base haze, painted once per resize. Denser toward the
 *                 edges, thinned over the center where text sits.
 *   mask buffer   the cursor wipe: white feathered blobs stamped at the
 *                 pointer that fade a little every frame, so fog creeps back.
 *   holes buffer  button shaped cutouts, so the fog never veils a control the
 *                 user is meant to click. Recomputed on scroll, resize and
 *                 navigation from the live positions of [data-fog-clear] nodes.
 *
 * Rendering at half resolution keeps the per frame cost tiny, and the CSS
 * upscale blurs the fog for free. The wipe loop only runs while there is
 * something to animate and stops once the trail heals; scroll and layout
 * changes recompose on demand without it.
 *
 * Readability is the hard constraint: base alpha stays low enough that text
 * under the fog is always legible, and buttons are cut out entirely.
 */

const SCALE = 0.5
// Slow heal so the wiped trail lingers before the fog rolls back.
const HEAL_ALPHA = 0.008
/*
 * Must outlast a full heal. At 0.008 per frame the mask decays as
 * (1 - 0.008)^n, reaching ~2% after roughly 8s of frames; stopping earlier
 * would freeze half healed wipe marks on screen until the next movement.
 */
const IDLE_STOP_MS = 9000

// Uniform, seamless base fog. Set to the densest gray that still holds muted
// text (#6b6b6b) at WCAG AA against white: the veil lightens it to about
// #767676, which measures ~4.5:1. Present everywhere at the same density, so
// text is readable anywhere; the cursor wipe reveals full clarity on top.
const BASE_ALPHA = 0.093
const FOG_GRAY = 226

function paintBaseFog(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strength: number,
) {
  ctx.clearRect(0, 0, width, height)
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = `rgba(${FOG_GRAY}, ${FOG_GRAY}, ${FOG_GRAY}, ${BASE_ALPHA * strength})`
  ctx.fillRect(0, 0, width, height)
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

/**
 * Paints the button cutouts into the holes buffer from the live positions of
 * every [data-fog-clear] node. White fill plus a white shadow gives a soft
 * feathered edge, so the fog fades out around each control rather than ending
 * on a hard line.
 */
function paintHoles(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.clearRect(0, 0, width, height)
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(255, 255, 255, 1)'
  ctx.shadowBlur = 26 * SCALE

  const pad = 6
  const nodes = document.querySelectorAll<HTMLElement>('[data-fog-clear]')
  nodes.forEach((node) => {
    const rect = node.getBoundingClientRect()
    if (rect.width < 1 || rect.height < 1) return
    if (rect.bottom < -30 || rect.top > window.innerHeight + 30) return
    roundedRectPath(
      ctx,
      (rect.left - pad) * SCALE,
      (rect.top - pad) * SCALE,
      (rect.width + pad * 2) * SCALE,
      (rect.height + pad * 2) * SCALE,
      6 * SCALE,
    )
    ctx.fill()
  })

  ctx.shadowBlur = 0
}

export function GlobalFog() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()
  const coarse = useCoarsePointer()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const fogBuffer = document.createElement('canvas')
    const holesBuffer = document.createElement('canvas')
    const maskBuffer = reduced ? null : document.createElement('canvas')
    const fogCtx = fogBuffer.getContext('2d')
    const holesCtx = holesBuffer.getContext('2d')
    const maskCtx = maskBuffer?.getContext('2d') ?? null
    if (!fogCtx || !holesCtx) return

    // Strength scales the whole haze. Full on desktop, where the reading band
    // sits exactly at the AA ceiling and the cursor can wipe for full clarity.
    // Touch and reduced motion pull it back a little, since there is no wipe to
    // clear the text: still dense and atmospheric, but with more reading margin.
    const strength = reduced ? 0.82 : coarse ? 0.72 : 1
    const wipeRadius = (coarse ? 240 : 200) * SCALE

    let rafId = 0
    let running = false
    let lastActivity = 0
    let lastHoles = 0
    let trackRaf = 0
    let trackUntil = 0
    let tracking = false
    const settleTimers: number[] = []
    const pointer = { x: -1, y: -1, fresh: false }

    const compose = () => {
      // The buffers can be zero sized before the first real layout (a pane that
      // opens at 0x0, or a hidden container). drawImage throws on a zero area
      // source, so bail until there is something to paint; the resize listener
      // recomposes once the viewport has real dimensions.
      if (canvas.width === 0 || canvas.height === 0) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-over'
      ctx.drawImage(fogBuffer, 0, 0)
      ctx.globalCompositeOperation = 'destination-out'
      if (maskBuffer) ctx.drawImage(maskBuffer, 0, 0)
      ctx.drawImage(holesBuffer, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
    }

    // Recompute the button cutouts and recomposite, synchronously. Paint is
    // cheap for a handful of controls at half resolution, and keeping it off
    // requestAnimationFrame means the holes stay correct even when the tab is
    // throttled. A short time throttle keeps a burst of scroll events in check.
    const paintHolesNow = () => {
      lastHoles = performance.now()
      paintHoles(holesCtx, holesBuffer.width, holesBuffer.height)
      compose()
    }
    const refreshHoles = () => {
      if (performance.now() - lastHoles < 12) return
      paintHolesNow()
    }

    // Page entrance and route transitions move the buttons through a framer
    // animation with no scroll to hook. rAF tracks them smoothly while it runs,
    // and timers settle the final positions even if rAF is throttled.
    const trackTick = () => {
      paintHolesNow()
      if (performance.now() < trackUntil) {
        trackRaf = requestAnimationFrame(trackTick)
      } else {
        tracking = false
      }
    }
    const trackFor = (ms: number) => {
      trackUntil = Math.max(trackUntil, performance.now() + ms)
      if (!tracking) {
        tracking = true
        trackRaf = requestAnimationFrame(trackTick)
      }
      for (const delay of [120, 360, 650, ms]) {
        settleTimers.push(window.setTimeout(paintHolesNow, delay))
      }
    }

    const resize = () => {
      const width = Math.round(window.innerWidth * SCALE)
      const height = Math.round(window.innerHeight * SCALE)
      for (const buffer of [canvas, fogBuffer, holesBuffer, maskBuffer]) {
        if (!buffer) continue
        buffer.width = width
        buffer.height = height
      }
      paintBaseFog(fogCtx, width, height, strength)
      paintHoles(holesCtx, width, height)
      compose()
    }

    const frame = (now: number) => {
      if (!maskCtx || !maskBuffer) return

      // The trail heals: the mask fades a little every frame.
      maskCtx.globalCompositeOperation = 'destination-out'
      maskCtx.fillStyle = `rgba(0, 0, 0, ${HEAL_ALPHA})`
      maskCtx.fillRect(0, 0, maskBuffer.width, maskBuffer.height)

      if (pointer.fresh) {
        pointer.fresh = false
        maskCtx.globalCompositeOperation = 'source-over'
        const gradient = maskCtx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          wipeRadius,
        )
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
        gradient.addColorStop(0.55, 'rgba(255, 255, 255, 0.9)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        maskCtx.fillStyle = gradient
        maskCtx.beginPath()
        maskCtx.arc(pointer.x, pointer.y, wipeRadius, 0, Math.PI * 2)
        maskCtx.fill()
      }

      compose()

      // Nothing left to animate once the trail has fully healed: stop until
      // the pointer moves again. By this point the mask is under two percent,
      // so snapping it empty is imperceptible and leaves a clean end state.
      if (now - lastActivity > IDLE_STOP_MS) {
        maskCtx.globalCompositeOperation = 'source-over'
        maskCtx.clearRect(0, 0, maskBuffer.width, maskBuffer.height)
        compose()
        running = false
        return
      }
      rafId = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running || !maskBuffer) return
      running = true
      lastActivity = performance.now()
      rafId = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(rafId)
    }

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX * SCALE
      pointer.y = event.clientY * SCALE
      pointer.fresh = true
      lastActivity = performance.now()
      if (!document.hidden) start()
    }

    const onVisibility = () => {
      if (document.hidden) stop()
    }

    // A click usually navigates or opens the menu, moving the buttons through
    // the route transition with no scroll. Follow them until it settles.
    const onClick = () => trackFor(900)

    resize()
    // Cover the initial page entrance and any web font reflow.
    trackFor(1200)

    window.addEventListener('resize', resize)
    window.addEventListener('scroll', refreshHoles, { passive: true })
    window.addEventListener('click', onClick, { passive: true, capture: true })
    if (!reduced) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.addEventListener('visibilitychange', onVisibility)
    }

    return () => {
      stop()
      cancelAnimationFrame(trackRaf)
      settleTimers.forEach(window.clearTimeout)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', refreshHoles)
      window.removeEventListener('click', onClick, { capture: true })
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced, coarse])

  return (
    <div className={styles.fog} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
