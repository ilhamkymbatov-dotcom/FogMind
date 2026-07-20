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
  /** Mastered node to newly available neighbor, the path that clears. */
  branches: FogBranch[]
}

// Local clearing radius in graph units by node status. Everything else stays
// under dense fog.
const CLEAR_RADIUS: Record<NodeStatus, number> = {
  locked: 0,
  available: 96,
  revealed: 136,
  mastered: 172,
}
const BRANCH_WIDTH = 78
const SWEEP_MS = 600

interface Cloud {
  x: number // 0..1 start position
  y: number
  r: number // radius as fraction of the larger canvas side
  vx: number // fraction per second
  vy: number
  alpha: number
}

// Several heavy cloud masses at different sizes, speeds and directions. They
// translate continuously and wrap seamlessly, so the mist reads as slow drift
// rather than a static haze.
const CLOUDS: Cloud[] = [
  { x: 0.15, y: 0.25, r: 0.5, vx: 0.012, vy: 0.006, alpha: 0.5 },
  { x: 0.7, y: 0.2, r: 0.58, vx: -0.009, vy: 0.008, alpha: 0.45 },
  { x: 0.4, y: 0.6, r: 0.62, vx: 0.007, vy: -0.01, alpha: 0.5 },
  { x: 0.85, y: 0.7, r: 0.46, vx: -0.014, vy: -0.005, alpha: 0.42 },
  { x: 0.05, y: 0.8, r: 0.52, vx: 0.011, vy: -0.007, alpha: 0.44 },
  { x: 0.55, y: 0.05, r: 0.44, vx: 0.006, vy: 0.012, alpha: 0.4 },
  { x: 0.3, y: 0.45, r: 0.68, vx: -0.006, vy: 0.004, alpha: 0.38 },
]

const wrap01 = (v: number) => ((v % 1) + 1) % 1

/**
 * A dense, slowly drifting grayscale cloud layer over the whole map, drawn on a
 * half resolution canvas above the graph. It is decorative: aria-hidden and
 * pointer-events none, so every click reaches the nodes beneath. Fog only
 * clears locally, a soft hole around each revealed or mastered node plus a
 * capsule that sweeps open along the branch to each newly available node.
 *
 * The draw loop is a single requestAnimationFrame that reads the latest props
 * through a ref, so it never restarts on a React render, and it pauses while
 * the tab is hidden. Reduced motion paints one thinner static frame.
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
    const baseAlpha = reduced ? 0.6 : 0.82

    let raf = 0
    let running = true

    const drawCloud = (cx: number, cy: number, r: number, alpha: number) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      g.addColorStop(0, `rgba(198, 198, 198, ${alpha})`)
      g.addColorStop(0.7, `rgba(198, 198, 198, ${alpha * 0.5})`)
      g.addColorStop(1, 'rgba(198, 198, 198, 0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
    }

    const punch = (cx: number, cy: number, radius: number, strength: number) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      g.addColorStop(0, `rgba(0, 0, 0, ${strength})`)
      g.addColorStop(0.6, `rgba(0, 0, 0, ${strength * 0.85})`)
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
      ctx.fillStyle = `rgba(202, 202, 202, ${baseAlpha})`
      ctx.fillRect(0, 0, w, h)

      // Moving cloud masses. Each is drawn at its wrapped position plus wrapped
      // copies near the edges, so it slides off one side and back on the other
      // with no pop.
      for (const cloud of CLOUDS) {
        const r = cloud.r * maxSide
        const px = wrap01(cloud.x + cloud.vx * seconds) * w
        const py = wrap01(cloud.y + cloud.vy * seconds) * h
        const xs = [px]
        const ys = [py]
        if (px < r) xs.push(px + w)
        if (px > w - r) xs.push(px - w)
        if (py < r) ys.push(py + h)
        if (py > h - r) ys.push(py - h)
        for (const cx of xs) for (const cy of ys) drawCloud(cx, cy, r, cloud.alpha)
      }

      // Clear locally.
      ctx.globalCompositeOperation = 'destination-out'
      const toScreen = (p: Point) => ({ x: (p.x * t.k + t.x) * scale, y: (p.y * t.k + t.y) * scale })

      for (const node of fogNodes) {
        const radius = CLEAR_RADIUS[node.status]
        if (radius <= 0) continue
        const p = toScreen(node.point)
        punch(p.x, p.y, radius * t.k * scale, node.status === 'available' ? 0.85 : 1)
      }

      for (const branch of fogBranches) {
        if (!branchStart.current.has(branch.key)) branchStart.current.set(branch.key, now)
        const started = branchStart.current.get(branch.key) as number
        const progress = reduced ? 1 : Math.min(1, (now - started) / SWEEP_MS)
        const from = toScreen(branch.from)
        const to = toScreen(branch.to)
        const steps = 12
        for (let i = 0; i <= steps; i++) {
          const f = (i / steps) * progress
          punch(from.x + (to.x - from.x) * f, from.y + (to.y - from.y) * f, ((BRANCH_WIDTH * t.k) / 2) * scale, 0.95)
        }
      }

      if (running && !reduced) raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)

    // Pause the loop while the tab is hidden; resume on return.
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
