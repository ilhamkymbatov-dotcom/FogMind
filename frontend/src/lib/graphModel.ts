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

export interface Point {
  x: number
  y: number
}

const X_GAP = 210
const Y_GAP = 150

/**
 * Lays the graph out as a tree growing bottom up: the starting node is the root
 * at the bottom centre, each breadth first level sits a row higher, and
 * children spread horizontally centred under their parent. Positions are in the
 * same coordinate space as the stored ones and replace them for rendering.
 */
export function treeLayout(nodes: Node[], edges: Edge[]): Map<string, Point> {
  const positions = new Map<string, Point>()
  if (nodes.length === 0) return positions

  const adjacency = buildAdjacency(edges)
  const starting = startingNodeIds(nodes, edges)

  const depth = new Map<string, number>()
  const children = new Map<string, string[]>()
  const visited = new Set<string>()

  // BFS forest from the starting nodes, then any stragglers as their own roots,
  // so every node lands in the tree exactly once.
  const roots = nodes.filter((n) => starting.has(n.id)).map((n) => n.id)
  for (const n of nodes) if (!roots.includes(n.id) && starting.size === 0) roots.push(n.id)

  const queue: string[] = []
  const seed = (id: string) => {
    if (visited.has(id)) return
    visited.add(id)
    depth.set(id, 0)
    queue.push(id)
  }
  roots.forEach(seed)
  while (queue.length > 0) {
    const u = queue.shift() as string
    const kids: string[] = []
    for (const v of adjacency.get(u) ?? []) {
      if (!visited.has(v)) {
        visited.add(v)
        depth.set(v, (depth.get(u) ?? 0) + 1)
        kids.push(v)
        queue.push(v)
      }
    }
    children.set(u, kids)
  }
  for (const n of nodes) if (!visited.has(n.id)) seed(n.id)

  // Assign an x slot per node: leaves take the next slot, parents centre over
  // their children.
  let slot = 0
  const xIndex = new Map<string, number>()
  const assign = (u: string) => {
    const kids = children.get(u) ?? []
    if (kids.length === 0) {
      xIndex.set(u, slot)
      slot += 1
      return
    }
    for (const k of kids) assign(k)
    const first = xIndex.get(kids[0]) ?? slot
    const last = xIndex.get(kids[kids.length - 1]) ?? slot
    xIndex.set(u, (first + last) / 2)
  }
  const layoutRoots = nodes
    .filter((n) => (depth.get(n.id) ?? 0) === 0 && !hasParent(n.id, children))
    .map((n) => n.id)
  for (const r of layoutRoots) assign(r)

  for (const n of nodes) {
    positions.set(n.id, {
      x: (xIndex.get(n.id) ?? 0) * X_GAP,
      // Root (depth 0) at the bottom; deeper levels rise upward (negative y).
      y: -(depth.get(n.id) ?? 0) * Y_GAP,
    })
  }
  return positions
}

function hasParent(id: string, children: Map<string, string[]>): boolean {
  for (const kids of children.values()) if (kids.includes(id)) return true
  return false
}

/** Fits the node bounding box into a viewport, returning a pan/zoom transform. */
export interface Transform {
  x: number
  y: number
  k: number
}

/** Fits an arbitrary set of points (the tree layout) into the viewport, leaving
 *  room for the card footprint and generous padding so the root at the bottom
 *  is never pressed against the edge. */
export function fitPoints(
  points: Point[],
  width: number,
  height: number,
  padding = 96,
  cardW = 160,
  cardH = 80,
): Transform {
  if (points.length === 0 || width === 0 || height === 0) return { x: 0, y: 0, k: 1 }
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  // The card is centred on its point, so half a card sticks out past the
  // extreme points on every side; count a whole card in the span for margin.
  const spanX = Math.max(maxX - minX, 1) + cardW
  const spanY = Math.max(maxY - minY, 1) + cardH
  const k = Math.min((width - padding * 2) / spanX, (height - padding * 2) / spanY, 1.3)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  return { x: width / 2 - cx * k, y: height / 2 - cy * k, k }
}

export function fitTransform(
  nodes: Node[],
  width: number,
  height: number,
  padding = 48,
  cardW = 176,
  cardH = 72,
): Transform {
  if (nodes.length === 0 || width === 0 || height === 0) return { x: 0, y: 0, k: 1 }
  const xs = nodes.map((n) => n.position_x)
  const ys = nodes.map((n) => n.position_y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  // The cards have real size in graph units, so the fit accounts for their
  // extents rather than the bare positions; the k that results fills the
  // viewport comfortably instead of floating tiny in the middle.
  const spanX = Math.max(maxX - minX, 1) + cardW
  const spanY = Math.max(maxY - minY, 1) + cardH
  const k = Math.min((width - padding * 2) / spanX, (height - padding * 2) / spanY, 1.5)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  return { x: width / 2 - cx * k, y: height / 2 - cy * k, k }
}
