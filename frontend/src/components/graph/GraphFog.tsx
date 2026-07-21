import { useEffect, useRef } from 'react'
import type { NodeStatus, Point, Transform } from '../../lib/graphModel'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export interface FogNode {
  id: string
  point: Point
  status: NodeStatus
}

export interface FogBranch {
  from: Point
  to: Point
  key: string
}

interface GraphFogProps {
  width: number
  height: number
  transform: Transform
  nodes: FogNode[]
  branches: FogBranch[]
}

// Local clearing radius in graph units. Strong, so text inside a pocket stays
// fully readable against the darker fog.
const CLEAR_RADIUS: Record<NodeStatus, number> = {
  locked: 0,
  available: 120,
  completed: 168,
  mastered: 200,
}
// Peak clearing strength by status. Below 1 so the pocket thins the mist to a
// readable haze rather than punching a pure white hole.
const CLEAR_STRENGTH: Record<NodeStatus, number> = {
  locked: 0,
  available: 0.7,
  completed: 0.86,
  mastered: 0.9,
}
const BRANCH_WIDTH = 72
const SWEEP_MS = 600

interface Blob {
  x: number // 0..1 start
  y: number
  r: number // radius as fraction of the larger canvas side
  vx: number // fraction per second
  vy: number
  gray: number // 0..255
  alpha: number
}

// A layered field of grayscale masses: large light bodies for the overall
// cover, medium darker cores for volume, and small dense billows for detail.
// Different scales, opacities and speeds give thick moving cloud with depth.
const FIELD: Blob[] = [
  { x: 0.2, y: 0.3, r: 0.52, vx: 0.01, vy: 0.005, gray: 158, alpha: 0.36 },
  { x: 0.75, y: 0.24, r: 0.56, vx: -0.008, vy: 0.007, gray: 150, alpha: 0.34 },
  { x: 0.46, y: 0.66, r: 0.6, vx: 0.006, vy: -0.009, gray: 156, alpha: 0.34 },
  { x: 0.86, y: 0.74, r: 0.46, vx: -0.012, vy: -0.004, gray: 146, alpha: 0.32 },
  { x: 0.1, y: 0.8, r: 0.5, vx: 0.009, vy: -0.006, gray: 152, alpha: 0.32 },
  { x: 0.32, y: 0.36, r: 0.28, vx: 0.014, vy: 0.009, gray: 96, alpha: 0.34 },
  { x: 0.64, y: 0.3, r: 0.3, vx: -0.011, vy: 0.011, gray: 104, alpha: 0.32 },
  { x: 0.5, y: 0.6, r: 0.26, vx: 0.012, vy: -0.013, gray: 90, alpha: 0.36 },
  { x: 0.8, y: 0.54, r: 0.24, vx: -0.016, vy: -0.007, gray: 108, alpha: 0.3 },
  { x: 0.16, y: 0.54, r: 0.27, vx: 0.013, vy: 0.006, gray: 98, alpha: 0.32 },
  { x: 0.4, y: 0.14, r: 0.22, vx: 0.017, vy: 0.012, gray: 114, alpha: 0.28 },
  { x: 0.56, y: 0.46, r: 0.14, vx: -0.021, vy: 0.015, gray: 78, alpha: 0.34 },
  { x: 0.28, y: 0.72, r: 0.15, vx: 0.019, vy: -0.017, gray: 84, alpha: 0.32 },
  { x: 0.72, y: 0.68, r: 0.13, vx: -0.018, vy: -0.013, gray: 76, alpha: 0.34 },
  { x: 0.6, y: 0.2, r: 0.12, vx: 0.022, vy: 0.018, gray: 86, alpha: 0.3 },
]

const wrap01 = (v: number) => ((v % 1) + 1) % 1

/**
 * A dense, dark, slowly billowing grayscale storm cloud layer over the whole
 * map, drawn on a half resolution canvas above the graph. Decorative:
 * aria-hidden and pointer-events none, so every click reaches the cards
 * beneath. Fog only clears locally, a strong readable pocket around each
 * revealed or mastered node plus a capsule that sweeps open along the branch to
 * each newly available node.
 *
 * A single requestAnimationFrame reads the latest props through a ref, so it
 * never restarts on a React render; it pauses while the tab is hidden. Clouds
 * translate continuously and wrap seamlessly. Reduced motion paints one thinner
 * static frame.
 */
export function GraphFog({ width, height, transform, nodes, branches }: GraphFogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()
  const latest = useRef({ transform, nodes, branches })
  latest.current = { transform, nodes, branches }
  const branchStart = useRef(new Map<string, number>())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width === 0 || height === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scale = reduced ? 1 : 0.6
    const w = Math.round(width * scale)
    const h = Math.round(height * scale)
    canvas.width = w
    canvas.height = h
    const maxSide = Math.max(w, h)
    // A medium base so the map is genuinely obscured; the field adds the light
    // and dark variation that reads as volume.
    const base = reduced ? 0.42 : 0.55

    let raf = 0
    let running = true

    const drawBlob = (cx: number, cy: number, r: number, gray: number, alpha: number) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      g.addColorStop(0, `rgba(${gray}, ${gray}, ${gray}, ${alpha})`)
      g.addColorStop(0.55, `rgba(${gray}, ${gray}, ${gray}, ${alpha * 0.5})`)
      g.addColorStop(1, `rgba(${gray}, ${gray}, ${gray}, 0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
    }

    // A wide, gradual feather so clearings blend into the mist instead of
    // reading as hard white bubbles. Only a small core is near full strength;
    // the rest is a long soft falloff.
    const punch = (cx: number, cy: number, radius: number, strength: number) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      g.addColorStop(0, `rgba(0, 0, 0, ${strength})`)
      g.addColorStop(0.35, `rgba(0, 0, 0, ${strength * 0.82})`)
      g.addColorStop(0.7, `rgba(0, 0, 0, ${strength * 0.32})`)
      g.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    const render = (now: number) => {
      const { transform: t, nodes: fogNodes, branches: fogBranches } = latest.current
      const seconds = reduced ? 0 : now / 1000

      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = `rgba(140, 140, 140, ${base})`
      ctx.fillRect(0, 0, w, h)

      for (const b of FIELD) {
        const r = b.r * maxSide
        const px = wrap01(b.x + b.vx * seconds) * w
        const py = wrap01(b.y + b.vy * seconds) * h
        const xs = [px]
        const ys = [py]
        if (px < r) xs.push(px + w)
        if (px > w - r) xs.push(px - w)
        if (py < r) ys.push(py + h)
        if (py > h - r) ys.push(py - h)
        for (const cx of xs) for (const cy of ys) drawBlob(cx, cy, r, b.gray, b.alpha)
      }

      ctx.globalCompositeOperation = 'destination-out'
      const toScreen = (p: Point) => ({ x: (p.x * t.k + t.x) * scale, y: (p.y * t.k + t.y) * scale })

      for (const node of fogNodes) {
        const radius = CLEAR_RADIUS[node.status]
        if (radius <= 0) continue
        const p = toScreen(node.point)
        punch(p.x, p.y, radius * t.k * scale, CLEAR_STRENGTH[node.status])
      }

      for (const branch of fogBranches) {
        if (!branchStart.current.has(branch.key)) branchStart.current.set(branch.key, now)
        const started = branchStart.current.get(branch.key) as number
        const progress = reduced ? 1 : Math.min(1, (now - started) / SWEEP_MS)
        const from = toScreen(branch.from)
        const to = toScreen(branch.to)
        const steps = 16
        for (let i = 0; i <= steps; i++) {
          const f = (i / steps) * progress
          punch(from.x + (to.x - from.x) * f, from.y + (to.y - from.y) * f, ((BRANCH_WIDTH * t.k) / 2) * scale, 0.82)
        }
      }

      if (running && !reduced) raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (!reduced && !running) {
        running = true
        raf = requestAnimationFrame(render)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [width, height, reduced])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}
