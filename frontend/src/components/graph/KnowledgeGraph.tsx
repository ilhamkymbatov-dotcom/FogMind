import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CircleCheck, CloudFog, Lock, Minus, Plus, Sparkles } from 'lucide-react'
import type { Edge, Node } from '@fogmind/backend'
import { fitPoints, type NodeStatus, type Point, type Transform } from '../../lib/graphModel'
import { GraphFog, type FogBranch, type FogNode } from './GraphFog'
import styles from './KnowledgeGraph.module.css'

interface KnowledgeGraphProps {
  nodes: Node[]
  edges: Edge[]
  positions: Map<string, Point>
  statusOf: (nodeId: string) => NodeStatus
  hintOf: (nodeId: string) => { correct: number; total: number }
  onOpen: (node: Node) => void
}

const MIN_K = 0.2
const MAX_K = 4
export const CARD_W = 150
export const CARD_H = 54

function clampK(k: number): number {
  return Math.min(MAX_K, Math.max(MIN_K, k))
}

const STATUS_ICON: Record<NodeStatus, typeof Lock> = {
  locked: Lock,
  available: CloudFog,
  revealed: Sparkles,
  mastered: CircleCheck,
}

/** A gentle vertical bezier from one node centre to another, for tree branches. */
function branchPath(a: Point, b: Point): string {
  const midY = (a.y + b.y) / 2
  return `M ${a.x} ${a.y} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`
}

export function KnowledgeGraph({ nodes, edges, positions, statusOf, hintOf, onOpen }: KnowledgeGraphProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [transform, setTransform] = useState<Transform | null>(null)
  const [settling, setSettling] = useState<Set<string>>(new Set())
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinchDist = useRef(0)
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
    setTransform(fitPoints([...positions.values()], size.w, size.h, 56, CARD_W, CARD_H))
  }, [transform, size, positions])

  useEffect(() => {
    const timers: number[] = []
    for (const node of nodes) {
      const status = statusOf(node.id)
      const prev = prevStatuses.current.get(node.id)
      if (prev && prev !== 'mastered' && status === 'mastered') {
        setSettling((s) => new Set(s).add(node.id))
        timers.push(
          window.setTimeout(() => {
            setSettling((s) => {
              const next = new Set(s)
              next.delete(node.id)
              return next
            })
          }, 700),
        )
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

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
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
  }, [])

  const t = transform ?? { x: 0, y: 0, k: 1 }

  const fogNodes: FogNode[] = useMemo(
    () => nodes.map((n) => ({ id: n.id, point: pos(n.id), status: statusOf(n.id) })),
    [nodes, pos, statusOf],
  )

  // A cleared branch for every mastered node bordering an available neighbor.
  const branches: FogBranch[] = useMemo(() => {
    const out: FogBranch[] = []
    for (const edge of edges) {
      const sa = statusOf(edge.source_node_id)
      const sb = statusOf(edge.target_node_id)
      if (sa === 'mastered' && sb === 'available') {
        out.push({ key: `${edge.source_node_id}-${edge.target_node_id}`, from: pos(edge.source_node_id), to: pos(edge.target_node_id) })
      } else if (sb === 'mastered' && sa === 'available') {
        out.push({ key: `${edge.target_node_id}-${edge.source_node_id}`, from: pos(edge.target_node_id), to: pos(edge.source_node_id) })
      }
    }
    return out
  }, [edges, statusOf, pos])

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <svg
        className={styles.svg}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="application"
        aria-label="Knowledge map"
      >
        <rect className={styles.background} x={0} y={0} width="100%" height="100%" fill="transparent" />
        <g transform={`translate(${t.x} ${t.y}) scale(${t.k})`}>
          {edges.map((edge) => {
            const a = pos(edge.source_node_id)
            const b = pos(edge.target_node_id)
            const sa = statusOf(edge.source_node_id)
            const sb = statusOf(edge.target_node_id)
            const cls = [
              styles.edge,
              sa === 'mastered' && sb === 'mastered' ? styles.edgeMastered : '',
            ]
              .filter(Boolean)
              .join(' ')
            return <path key={edge.id} className={cls} d={branchPath(a, b)} fill="none" />
          })}

          {nodes.map((node) => {
            const status = statusOf(node.id)
            const clickable = status === 'available' || status === 'revealed'
            const hint = hintOf(node.id)
            const Icon = STATUS_ICON[status]
            const p = pos(node.id)
            const cardCls = [
              styles.card,
              styles[`card_${status}`],
              settling.has(node.id) ? styles.cardSettle : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <foreignObject
                key={node.id}
                x={p.x - CARD_W / 2}
                y={p.y - CARD_H / 2}
                width={CARD_W}
                height={CARD_H}
                className={styles.cardWrap}
              >
                <div
                  className={cardCls}
                  role={clickable ? 'button' : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  aria-label={clickable ? `Open ${node.title}` : undefined}
                  onClick={() => clickable && onOpen(node)}
                  onKeyDown={(e) => {
                    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault()
                      onOpen(node)
                    }
                  }}
                >
                  <Icon className={styles.cardIcon} size={14} aria-hidden="true" />
                  <div className={styles.cardBody}>
                    <span className={styles.cardTitle}>{node.title}</span>
                    {status !== 'locked' && hint.total > 0 ? (
                      <span className={styles.cardHint}>
                        {Math.min(hint.correct, hint.total)} of {hint.total} answered
                      </span>
                    ) : null}
                  </div>
                </div>
              </foreignObject>
            )
          })}
        </g>
      </svg>

      <GraphFog width={size.w} height={size.h} transform={t} nodes={fogNodes} branches={branches} />

      <div className={styles.controls}>
        <button type="button" className={styles.controlButton} aria-label="Zoom in" onClick={() => zoomAround(size.w / 2, size.h / 2, 1.2)}>
          <Plus size={18} aria-hidden="true" />
        </button>
        <button type="button" className={styles.controlButton} aria-label="Zoom out" onClick={() => zoomAround(size.w / 2, size.h / 2, 1 / 1.2)}>
          <Minus size={18} aria-hidden="true" />
        </button>
      </div>
      <p className={styles.hint}>Drag to pan, scroll or pinch to zoom</p>
    </div>
  )
}
