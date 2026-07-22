import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, CircleCheck, CloudFog, Lock, Minus, Plus } from 'lucide-react'
import type { Edge, Node } from '@fogmind/backend'
import { useTranslation } from '../../i18n'
import { CARD_H, CARD_W, fitPoints, type NodeStatus, type Point } from '../../lib/graphModel'
import { useFogLayers, type FogBranch, type FogNode } from './useFogLayers'
import styles from './KnowledgeGraph.module.css'

interface KnowledgeGraphProps {
  nodes: Node[]
  edges: Edge[]
  positions: Map<string, Point>
  statusOf: (nodeId: string) => NodeStatus
  hintOf: (nodeId: string) => { answered: number; total: number }
  onOpen: (node: Node) => void
}

const MIN_K = 0.2
const MAX_K = 4
export { CARD_H, CARD_W }

/**
 * The smallest scale the map will open at. Below this a card stops being
 * readable and stops being a 44px target, which matters most on a phone, where
 * the natural fit is smallest.
 */
const MIN_FIT_K = 0.82

function clampK(k: number): number {
  return Math.min(MAX_K, Math.max(MIN_K, k))
}

const STATUS_ICON: Record<NodeStatus, typeof Lock> = {
  locked: Lock,
  available: CloudFog,
  completed: Check,
  mastered: CircleCheck,
}

const cleared = (status: NodeStatus) => status === 'completed' || status === 'mastered'

/** A stable -1..1 from an id, so every branch keeps its own bend across renders. */
function bowOf(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return ((hash >>> 0) % 2000) / 1000 - 1
}

/**
 * A grown limb rather than a wire: the classic vertical ease between two rows,
 * pushed sideways by a per branch amount so even a perfectly vertical link
 * bends. Control points sit on the midline, which keeps the curve leaving and
 * entering each card cleanly.
 */
function branchPath(a: Point, b: Point, bow: number): string {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.hypot(dx, dy) || 1
  const nx = -dy / length
  const ny = dx / length
  const offset = bow * Math.min(length * 0.2, 38)
  const midY = (a.y + b.y) / 2
  const c1x = a.x + nx * offset
  const c1y = midY + ny * offset
  const c2x = b.x + nx * offset
  const c2y = midY + ny * offset
  return `M ${a.x} ${a.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${b.x} ${b.y}`
}

export function KnowledgeGraph({ nodes, edges, positions, statusOf, hintOf, onOpen }: KnowledgeGraphProps) {
  const { t: tr } = useTranslation()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [transform, setTransform] = useState<{ x: number; y: number; k: number } | null>(null)
  const [settling, setSettling] = useState<Set<string>>(new Set())
  const [emerging, setEmerging] = useState<Set<string>>(new Set())
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinchDist = useRef(0)
  const panning = useRef(false)
  const prevStatuses = useRef(new Map<string, NodeStatus>())

  const pos = useCallback((id: string): Point => positions.get(id) ?? { x: 0, y: 0 }, [positions])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    observer.observe(el)
    setSize({ w: el.clientWidth, h: el.clientHeight })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (transform || size.w === 0 || positions.size === 0) return
    const all = [...positions.values()]
    const natural = fitPoints(all, size.w, size.h, 96, CARD_W, CARD_H)
    if (natural.k >= MIN_FIT_K) {
      setTransform(natural)
      return
    }
    // The whole tree will not fit at a scale where a card is still legible and
    // still a real touch target, which is the normal case on a phone. Rather
    // than shrink it into confetti, hold the scale and open on the part of the
    // map that can actually be acted on. Everything else is a pan away.
    const focus = nodes.filter((n) => statusOf(n.id) !== 'locked').map((n) => pos(n.id))
    const points = focus.length > 0 ? focus : all
    const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length
    const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length
    setTransform({ k: MIN_FIT_K, x: size.w / 2 - cx * MIN_FIT_K, y: size.h / 2 - cy * MIN_FIT_K })
  }, [transform, size, positions, nodes, statusOf, pos])

  // Two moments worth marking: a node stepping out of the fog for the first
  // time, and a node being finished perfectly. Everything else changes quietly.
  useEffect(() => {
    const timers: number[] = []
    const clear = (set: (updater: (s: Set<string>) => Set<string>) => void, id: string, ms: number) => {
      timers.push(
        window.setTimeout(() => {
          set((s) => {
            const next = new Set(s)
            next.delete(id)
            return next
          })
        }, ms),
      )
    }

    for (const node of nodes) {
      const status = statusOf(node.id)
      const prev = prevStatuses.current.get(node.id)
      if (prev && prev !== status) {
        if (prev === 'locked' && status !== 'locked') {
          setEmerging((s) => new Set(s).add(node.id))
          clear(setEmerging, node.id, 900)
        }
        if (prev !== 'mastered' && status === 'mastered') {
          setSettling((s) => new Set(s).add(node.id))
          clear(setSettling, node.id, 700)
        }
      }
      prevStatuses.current.set(node.id, status)
    }
    return () => timers.forEach(window.clearTimeout)
  }, [nodes, statusOf])

  const zoomAround = useCallback((cx: number, cy: number, factor: number) => {
    setTransform((t) => {
      if (!t) return t
      const k = clampK(t.k * factor)
      const scale = k / t.k
      return { k, x: cx - (cx - t.x) * scale, y: cy - (cy - t.y) * scale }
    })
  }, [])

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      const rect = wrapRef.current?.getBoundingClientRect()
      if (!rect) return
      zoomAround(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? 1.1 : 1 / 1.1)
    },
    [zoomAround],
  )

  // Pan is handled on the wrap. A press that lands on a card is left alone so
  // the card receives its click; no pointer capture is ever put on a card.
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as Element).closest('[data-fog-card]')) return
    panning.current = true
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinchDist.current = Math.hypot(a.x - b.x, a.y - b.y)
    }
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const prev = pointers.current.get(e.pointerId)
      if (!prev) return
      const next = { x: e.clientX, y: e.clientY }
      pointers.current.set(e.pointerId, next)
      if (pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()]
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        const rect = wrapRef.current?.getBoundingClientRect()
        if (pinchDist.current > 0 && rect) {
          zoomAround((a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top, dist / pinchDist.current)
        }
        pinchDist.current = dist
        return
      }
      setTransform((t) => (t ? { ...t, x: t.x + (next.x - prev.x), y: t.y + (next.y - prev.y) } : t))
    },
    [zoomAround],
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinchDist.current = 0
    if (pointers.current.size === 0) panning.current = false
  }, [])

  const t = transform ?? { x: 0, y: 0, k: 1 }
  const layerTransform = `translate3d(${t.x}px, ${t.y}px, 0) scale(${t.k})`

  const fogNodes: FogNode[] = useMemo(
    () => nodes.map((n) => ({ id: n.id, point: pos(n.id), status: statusOf(n.id) })),
    [nodes, pos, statusOf],
  )

  // Clearing follows the tree: the mist thins along every branch that links two
  // cleared nodes, and along the branch that leads from a cleared node to the
  // next available one, so the path reads as an opening rather than stamped
  // circles.
  const branches: FogBranch[] = useMemo(() => {
    const out: FogBranch[] = []
    for (const edge of edges) {
      const sa = statusOf(edge.source_node_id)
      const sb = statusOf(edge.target_node_id)
      if (cleared(sa) && cleared(sb)) {
        out.push({ key: `link-${edge.id}`, from: pos(edge.source_node_id), to: pos(edge.target_node_id) })
      } else if (cleared(sa) && sb === 'available') {
        out.push({ key: `${edge.source_node_id}-${edge.target_node_id}`, from: pos(edge.source_node_id), to: pos(edge.target_node_id) })
      } else if (cleared(sb) && sa === 'available') {
        out.push({ key: `${edge.target_node_id}-${edge.source_node_id}`, from: pos(edge.target_node_id), to: pos(edge.source_node_id) })
      }
    }
    return out
  }, [edges, statusOf, pos])

  const fog = useFogLayers({ width: size.w, height: size.h, transform: t, nodes: fogNodes, branches })

  return (
    <div
      className={styles.wrap}
      ref={wrapRef}
      role="application"
      aria-label={tr('graph.mapLabel')}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Layer 0: the haze that passes behind the cards, so the graph sits
          inside the weather instead of on top of it. */}
      <canvas ref={fog.backRef} className={styles.fogBack} aria-hidden="true" />

      {/* Layer 1: branches only, pure SVG. Decorative, no input. */}
      <svg className={styles.edges} aria-hidden="true">
        <g transform={`translate(${t.x} ${t.y}) scale(${t.k})`}>
          {edges.map((edge) => {
            const a = pos(edge.source_node_id)
            const b = pos(edge.target_node_id)
            const sa = statusOf(edge.source_node_id)
            const sb = statusOf(edge.target_node_id)
            const bow = bowOf(edge.id)
            const d = branchPath(a, b, bow)
            // A limb drawn by hand is never one weight the whole way.
            const width = 1.15 + Math.abs(bow) * 0.75

            const grown = cleared(sa) && cleared(sb)
            const leading = (cleared(sa) && sb === 'available') || (cleared(sb) && sa === 'available')

            return (
              <g key={edge.id}>
                {grown || leading ? (
                  <path className={styles.edgeGlow} d={d} fill="none" strokeWidth={width * 6} />
                ) : null}
                <path
                  className={[styles.edge, grown || leading ? styles.edgeLit : ''].filter(Boolean).join(' ')}
                  d={d}
                  fill="none"
                  strokeWidth={width}
                />
                {/* A spark travelling the limb toward what opens next. Drawn
                    over the solid stroke, so the branch never reads as dashed. */}
                {leading ? (
                  <path className={styles.edgeSpark} d={d} fill="none" strokeWidth={width * 1.5} />
                ) : null}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Layer 2: node cards as plain HTML, positioned in the same transformed
          space. This avoids SVG foreignObject entirely, which Safari mishandles
          (flicker and unreliable hit testing). */}
      <div className={styles.cardLayer} style={{ transform: layerTransform }}>
        {nodes.map((node) => {
          const status = statusOf(node.id)
          const clickable = status === 'available'
          const hint = hintOf(node.id)
          const Icon = STATUS_ICON[status]
          const p = pos(node.id)
          const cardCls = [
            styles.card,
            styles[`card_${status}`],
            settling.has(node.id) ? styles.cardSettle : '',
            emerging.has(node.id) ? styles.cardEmerge : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <div
              key={node.id}
              className={cardCls}
              data-fog-card=""
              style={{ left: p.x, top: p.y, width: CARD_W, height: CARD_H, marginLeft: -CARD_W / 2, marginTop: -CARD_H / 2 }}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              aria-label={clickable ? tr('graph.open', { title: node.title }) : undefined}
              aria-hidden={clickable ? undefined : true}
              onClick={() => clickable && onOpen(node)}
              onKeyDown={(e) => {
                if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  onOpen(node)
                }
              }}
            >
              <span className={styles.cardIconWrap} aria-hidden="true">
                <Icon className={styles.cardIcon} size={17} />
              </span>
              <div className={styles.cardBody}>
                <span className={styles.cardTitle}>{node.title}</span>
                {status !== 'locked' && hint.total > 0 ? (
                  <span className={styles.cardHint}>
                    {tr('graph.answered', { answered: Math.min(hint.answered, hint.total), total: hint.total })}
                  </span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {/* Layer 3: the weather itself, decorative and click through, painted
          above the cards so it visibly shrouds them while pockets tear open. */}
      <canvas ref={fog.frontRef} className={styles.fogFront} aria-hidden="true" />

      <div className={styles.controls}>
        <button type="button" className={styles.controlButton} aria-label={tr('graph.zoomIn')} onClick={() => zoomAround(size.w / 2, size.h / 2, 1.2)}>
          <Plus size={18} aria-hidden="true" />
        </button>
        <button type="button" className={styles.controlButton} aria-label={tr('graph.zoomOut')} onClick={() => zoomAround(size.w / 2, size.h / 2, 1 / 1.2)}>
          <Minus size={18} aria-hidden="true" />
        </button>
      </div>
      <p className={styles.hint}>{tr('graph.panHint')}</p>
    </div>
  )
}
