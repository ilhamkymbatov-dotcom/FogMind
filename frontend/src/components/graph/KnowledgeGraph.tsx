import { useCallback, useEffect, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import type { Edge, Node } from '@fogmind/backend'
import { fitTransform, type NodeStatus, type Transform } from '../../lib/graphModel'
import styles from './KnowledgeGraph.module.css'

interface KnowledgeGraphProps {
  nodes: Node[]
  edges: Edge[]
  statusOf: (nodeId: string) => NodeStatus
  onOpen: (node: Node) => void
}

const MIN_K = 0.2
const MAX_K = 4
const NODE_R = 13

function clampK(k: number): number {
  return Math.min(MAX_K, Math.max(MIN_K, k))
}

function truncate(text: string, max = 26): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

export function KnowledgeGraph({ nodes, edges, statusOf, onOpen }: KnowledgeGraphProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [transform, setTransform] = useState<Transform | null>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinchDist = useRef(0)
  const nodeById = useRef(new Map(nodes.map((n) => [n.id, n])))
  nodeById.current = new Map(nodes.map((n) => [n.id, n]))

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight })
    })
    observer.observe(el)
    setSize({ w: el.clientWidth, h: el.clientHeight })
    return () => observer.disconnect()
  }, [])

  // Fit the graph once the size and nodes are known.
  useEffect(() => {
    if (transform || size.w === 0 || nodes.length === 0) return
    setTransform(fitTransform(nodes, size.w, size.h))
  }, [transform, size, nodes])

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
          const mx = (a.x + b.x) / 2 - rect.left
          const my = (a.y + b.y) / 2 - rect.top
          zoomAround(mx, my, dist / pinchDist.current)
        }
        pinchDist.current = dist
        return
      }

      const dx = next.x - prev.x
      const dy = next.y - prev.y
      setTransform((t) => (t ? { ...t, x: t.x + dx, y: t.y + dy } : t))
    },
    [zoomAround],
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinchDist.current = 0
  }, [])

  const t = transform ?? { x: 0, y: 0, k: 1 }

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
        <defs>
          <filter id="fogBlur" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        <rect className={styles.background} x={0} y={0} width="100%" height="100%" fill="transparent" />

        <g transform={`translate(${t.x} ${t.y}) scale(${t.k})`}>
          {edges.map((edge) => {
            const a = nodeById.current.get(edge.source_node_id)
            const b = nodeById.current.get(edge.target_node_id)
            if (!a || !b) return null
            return (
              <line
                key={edge.id}
                className={styles.edge}
                x1={a.position_x}
                y1={a.position_y}
                x2={b.position_x}
                y2={b.position_y}
              />
            )
          })}

          {/* Fog sits above the edges but below the node discs. */}
          {nodes.map((node) => {
            const status = statusOf(node.id)
            if (status === 'revealed' || status === 'mastered') return null
            const locked = status === 'locked'
            return (
              <circle
                key={`fog-${node.id}`}
                className={styles.fog}
                cx={node.position_x}
                cy={node.position_y}
                r={NODE_R * (locked ? 2.6 : 2)}
                opacity={locked ? 0.8 : 0.5}
                filter="url(#fogBlur)"
              />
            )
          })}

          {nodes.map((node) => {
            const status = statusOf(node.id)
            const clickable = status === 'available' || status === 'revealed'
            const discClass = [
              styles.disc,
              status === 'available' ? styles.discAvailable : '',
              status === 'revealed' ? styles.discRevealed : '',
              status === 'mastered' ? styles.discMastered : '',
              status === 'locked' ? styles.discLocked : '',
            ]
              .filter(Boolean)
              .join(' ')
            const labelClass = [
              styles.label,
              status === 'locked' ? styles.labelMuted : '',
              status === 'mastered' ? styles.labelMastered : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <g
                key={node.id}
                className={[styles.node, clickable ? styles.nodeClickable : ''].filter(Boolean).join(' ')}
                opacity={status === 'locked' ? 0.55 : 1}
                onClick={() => clickable && onOpen(node)}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                aria-label={clickable ? `Open ${node.title}` : undefined}
                onKeyDown={(e) => {
                  if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    onOpen(node)
                  }
                }}
              >
                <circle className={discClass} cx={node.position_x} cy={node.position_y} r={NODE_R} />
                {status === 'mastered' ? (
                  <circle className={styles.core} cx={node.position_x} cy={node.position_y} r={NODE_R * 0.42} />
                ) : null}
                <text
                  className={labelClass}
                  x={node.position_x}
                  y={node.position_y + NODE_R + 14}
                  fontSize={11}
                >
                  {truncate(node.title)}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.controlButton}
          aria-label="Zoom in"
          onClick={() => zoomAround(size.w / 2, size.h / 2, 1.2)}
        >
          <Plus size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={styles.controlButton}
          aria-label="Zoom out"
          onClick={() => zoomAround(size.w / 2, size.h / 2, 1 / 1.2)}
        >
          <Minus size={18} aria-hidden="true" />
        </button>
      </div>
      <p className={styles.hint}>Drag to pan, scroll or pinch to zoom</p>
    </div>
  )
}
