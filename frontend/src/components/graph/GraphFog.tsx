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
  available: 92,
  revealed: 132,
  mastered: 168,
}
const BRANCH_WIDTH = 74
const SWEEP_MS = 600

/**
 * A dense, slowly drifting grayscale fog over the whole map, drawn on a half
 * resolution canvas above the graph. It never intercepts pointer input. Fog
 * only clears locally: a soft hole around each revealed or mastered node, and a
 * capsule that sweeps open along the branch to each newly available node.
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
    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(height * scale)
    let raf = 0

    const draw = (now: number) => {
      const { transform: t, nodes: fogNodes, branches: fogBranches } = latest.current
      const w = canvas.width
      const h = canvas.height
      const s = scale
      const drift = reduced ? 0 : now / 1000

      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'

      // Dense base plus a few drifting blobs to read as layered mist.
      const baseAlpha = reduced ? 0.62 : 0.8
      ctx.fillStyle = `rgba(206, 206, 206, ${baseAlpha})`
      ctx.fillRect(0, 0, w, h)
      const blobs = 7
      for (let i = 0; i < blobs; i++) {
        const bx = ((i * 0.37 + Math.sin(drift * 0.2 + i) * 0.06 + 0.1) % 1) * w
        const by = ((i * 0.61 + Math.cos(drift * 0.17 + i) * 0.05 + 0.2) % 1) * h
        const r = Math.max(w, h) * 0.36
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, r)
        g.addColorStop(0, 'rgba(196, 196, 196, 0.5)')
        g.addColorStop(1, 'rgba(196, 196, 196, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(bx, by, r, 0, Math.PI * 2)
        ctx.fill()
      }

      // Punch soft holes where the map is cleared.
      ctx.globalCompositeOperation = 'destination-out'
      const toScreen = (p: Point) => ({ x: (p.x * t.k + t.x) * s, y: (p.y * t.k + t.y) * s })
      const punch = (cx: number, cy: number, radius: number, strength = 1) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        g.addColorStop(0, `rgba(0, 0, 0, ${strength})`)
        g.addColorStop(0.6, `rgba(0, 0, 0, ${strength * 0.85})`)
        g.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fill()
      }

      for (const node of fogNodes) {
        const radius = CLEAR_RADIUS[node.status]
        if (radius <= 0) continue
        const p = toScreen(node.point)
        const strength = node.status === 'available' ? 0.82 : 1
        punch(p.x, p.y, radius * t.k * s, strength)
      }

      // Branches sweep open from the mastered node toward the new neighbor.
      for (const branch of fogBranches) {
        if (!branchStart.current.has(branch.key)) {
          branchStart.current.set(branch.key, now)
        }
        const started = branchStart.current.get(branch.key) as number
        const progress = reduced ? 1 : Math.min(1, (now - started) / SWEEP_MS)
        const from = toScreen(branch.from)
        const to = toScreen(branch.to)
        const steps = 10
        for (let i = 0; i <= steps; i++) {
          const f = (i / steps) * progress
          punch(from.x + (to.x - from.x) * f, from.y + (to.y - from.y) * f, ((BRANCH_WIDTH * t.k) / 2) * s, 0.95)
        }
      }

      if (!reduced) raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [width, height, reduced])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}
