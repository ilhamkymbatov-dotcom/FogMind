import { useEffect, useRef } from 'react'
import { useCoarsePointer, usePrefersReducedMotion } from '../motion/useMediaQuery'
import styles from './GlobalFog.module.css'

/*
 * The site wide brand fog. One fixed, full viewport canvas lives in the app
 * shell, so it persists across route changes. A soft grayscale haze covers
 * everything, and the pointer wipes it clear as it moves, like mist on glass;
 * the wiped trail slowly heals behind you.
 *
 * How it renders: three low resolution buffers.
 *   fog buffer   the base haze, painted once per resize
 *   mask buffer  the wiped areas, white feathered blobs stamped at the
 *                pointer; every frame it fades a little (destination-out),
 *                which is what makes the fog creep back
 *   main canvas  fog buffer minus mask buffer (destination-out), upscaled by
 *                CSS. Rendering at half resolution keeps the per frame cost
 *                tiny, and the upscale blurs the fog for free.
 *
 * The loop only runs while there is something to animate: it stops a couple of
 * seconds after the last pointer movement, once the trail has healed, and a
 * new movement starts it again. Hidden tab stops it too.
 *
 * Readability is the hard constraint: base alpha stays low enough that text
 * under the fog is always legible, the wipe just makes it crystal clear.
 */

const SCALE = 0.5
const HEAL_ALPHA = 0.014
/*
 * Must outlast a full heal. At 0.014 per frame the mask decays as
 * (1 - 0.014)^n, reaching ~2% after roughly 4.6s of frames; stopping earlier
 * would freeze half healed wipe marks on screen until the next movement.
 */
const IDLE_STOP_MS = 6000

function paintBaseFog(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strength: number,
) {
  ctx.clearRect(0, 0, width, height)
  ctx.globalCompositeOperation = 'source-over'

  ctx.fillStyle = `rgba(234, 234, 234, ${0.11 * strength})`
  ctx.fillRect(0, 0, width, height)

  // Denser wisps toward the edges keep the center, where text lives, lightest.
  for (let i = 0; i < 14; i++) {
    let x = Math.random() * width
    let y = Math.random() * height
    if (i < 9) {
      if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? Math.random() * width * 0.22 : width - Math.random() * width * 0.22
      } else {
        y =
          Math.random() < 0.5 ? Math.random() * height * 0.22 : height - Math.random() * height * 0.22
      }
    }
    const radius = (110 + Math.random() * 190) * SCALE * 2
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, `rgba(226, 226, 226, ${0.12 * strength})`)
    gradient.addColorStop(1, 'rgba(226, 226, 226, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  // Readability guarantee: however the random wisps landed, thin the reading
  // zone in the middle of the viewport so body text always sits under the
  // lightest fog.
  const clearRadius = Math.min(width, height) * 0.55
  const center = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    clearRadius,
  )
  center.addColorStop(0, 'rgba(0, 0, 0, 0.5)')
  center.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = center
  ctx.beginPath()
  ctx.arc(width / 2, height / 2, clearRadius, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
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

    // Reduced motion: a faint static haze, painted once. No loop, no wipe, no
    // listeners, and light enough that nothing is ever trapped underneath.
    if (reduced) {
      const resizeStatic = () => {
        canvas.width = Math.round(window.innerWidth * SCALE)
        canvas.height = Math.round(window.innerHeight * SCALE)
        paintBaseFog(ctx, canvas.width, canvas.height, 0.5)
      }
      resizeStatic()
      window.addEventListener('resize', resizeStatic)
      return () => window.removeEventListener('resize', resizeStatic)
    }

    const fogBuffer = document.createElement('canvas')
    const maskBuffer = document.createElement('canvas')
    const fogCtx = fogBuffer.getContext('2d')
    const maskCtx = maskBuffer.getContext('2d')
    if (!fogCtx || !maskCtx) return

    // Touch screens get a lighter haze and a wider wipe: there is no hovering
    // cursor, so the fog must never make anyone work to read.
    const strength = coarse ? 0.6 : 1
    const wipeRadius = (coarse ? 140 : 110) * SCALE

    let rafId = 0
    let running = false
    let lastActivity = 0
    const pointer = { x: -1, y: -1, fresh: false }

    const resize = () => {
      const width = Math.round(window.innerWidth * SCALE)
      const height = Math.round(window.innerHeight * SCALE)
      canvas.width = width
      canvas.height = height
      fogBuffer.width = width
      fogBuffer.height = height
      maskBuffer.width = width
      maskBuffer.height = height
      paintBaseFog(fogCtx, width, height, strength)
      compose()
    }

    const compose = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-over'
      ctx.drawImage(fogBuffer, 0, 0)
      ctx.globalCompositeOperation = 'destination-out'
      ctx.drawImage(maskBuffer, 0, 0)
    }

    const frame = (now: number) => {
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
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.55)')
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
      if (running) return
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

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      window.removeEventListener('resize', resize)
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
