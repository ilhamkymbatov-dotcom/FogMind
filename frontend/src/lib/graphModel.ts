import type { Edge, Node, Progress, ProgressState } from '@fogmind/backend'

/**
 * The visual and interactive state of a node, derived from its persisted
 * progress state plus the chain unlock rule. Only the four persisted states
 * live in the database; `locked` and `available` are computed client side.
 */
export type NodeStatus = 'locked' | 'available' | 'revealed' | 'mastered'

/** Node ids with no incoming edge, or the first node if every node has one. */
export function startingNodeIds(nodes: Node[], edges: Edge[]): Set<string> {
  const hasIncoming = new Set(edges.map((e) => e.target_node_id))
  const starts = new Set(nodes.filter((n) => !hasIncoming.has(n.id)).map((n) => n.id))
  if (starts.size === 0 && nodes.length > 0) starts.add(nodes[0].id)
  return starts
}

/** Undirected adjacency: an edge connects both endpoints as neighbors. */
export function buildAdjacency(edges: Edge[]): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>()
  const link = (a: string, b: string) => {
    const set = adjacency.get(a) ?? new Set<string>()
    set.add(b)
    adjacency.set(a, set)
  }
  for (const edge of edges) {
    link(edge.source_node_id, edge.target_node_id)
    link(edge.target_node_id, edge.source_node_id)
  }
  return adjacency
}

export function deriveStatus(
  nodeId: string,
  state: ProgressState,
  starting: Set<string>,
  mastered: Set<string>,
  adjacency: Map<string, Set<string>>,
): NodeStatus {
  if (state === 'mastered') return 'mastered'
  if (state === 'revealed') return 'revealed'
  // state is fogged: available if it is a start or borders a mastered node.
  if (starting.has(nodeId)) return 'available'
  for (const neighbor of adjacency.get(nodeId) ?? []) {
    if (mastered.has(neighbor)) return 'available'
  }
  return 'locked'
}

export interface ProgressSummary {
  mastered: number
  total: number
  percent: number
}

export function summarize(progress: Map<string, Progress>, total: number): ProgressSummary {
  let mastered = 0
  for (const p of progress.values()) if (p.state === 'mastered') mastered += 1
  return { mastered, total, percent: total === 0 ? 0 : Math.round((mastered / total) * 100) }
}

/** Fits the node bounding box into a viewport, returning a pan/zoom transform. */
export interface Transform {
  x: number
  y: number
  k: number
}

export function fitTransform(
  nodes: Node[],
  width: number,
  height: number,
  padding = 80,
): Transform {
  if (nodes.length === 0 || width === 0 || height === 0) return { x: 0, y: 0, k: 1 }
  const xs = nodes.map((n) => n.position_x)
  const ys = nodes.map((n) => n.position_y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const spanX = Math.max(maxX - minX, 1)
  const spanY = Math.max(maxY - minY, 1)
  const k = Math.min((width - padding * 2) / spanX, (height - padding * 2) / spanY, 1.6)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  return { x: width / 2 - cx * k, y: height / 2 - cy * k, k }
}
