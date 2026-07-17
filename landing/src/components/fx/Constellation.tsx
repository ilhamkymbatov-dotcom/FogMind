import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../motion/useMediaQuery'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
}

const LINK_DISTANCE = 120
const SPEED = 0.12

/**
 * A very faint drifting network of nodes and thin lines behind the hero, a
 * hint of the knowledge map. Light gray on white, low alpha, reads as texture.
 * Decorative only: aria-hidden, pointer-events none.
 *
 * The draw loop pauses whenever the canvas leaves the viewport or the tab is
 * hidden, and the node count halves on narrow screens.
 */
export function Constellation({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let nodes: Node[] = []
    let width = 0
    let height = 0
    let rafId = 0
    let running = false

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const seed = () => {
      const count = width < 640 ? 12 : 26
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED * 2,
        vy: (Math.random() - 0.5) * SPEED * 2,
      }))
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    const frame = () => {
      ctx.clearRect(0, 0, width, height)

      for (const node of nodes) {
        node.x += node.vx
        node.y += node.vy
        // Wrap around the edges so drift never runs out.
        if (node.x < -10) node.x = width + 10
        if (node.x > width + 10) node.x = -10
        if (node.y < -10) node.y = height + 10
        if (node.y > height + 10) node.y = -10
      }

      ctx.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.hypot(dx, dy)
          if (dist < LINK_DISTANCE) {
            const fade = 1 - dist / LINK_DISTANCE
            ctx.strokeStyle = `rgba(0, 0, 0, ${(0.055 * fade).toFixed(3)})`
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.10)'
      for (const node of nodes) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, 1.6, 0, Math.PI * 2)
        ctx.fill()
      }

      rafId = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running) return
      running = true
      rafId = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(rafId)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !document.hidden) start()
      else stop()
    })
    io.observe(canvas)

    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      observer.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced])

  if (reduced) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      aria-hidden="true"
    />
  )
}
