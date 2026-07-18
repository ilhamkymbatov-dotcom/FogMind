import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getDocument,
  listEdgesForDocument,
  listNodesForDocument,
  listProgressForNodes,
  listQuestionsForNodes,
  updateProgress,
  type Document,
  type Edge,
  type Node,
  type Progress,
  type ProgressState,
  type Question,
} from '@fogmind/backend'
import { supabase } from './supabase'
import {
  buildAdjacency,
  deriveStatus,
  startingNodeIds,
  summarize,
  type NodeStatus,
  type ProgressSummary,
} from './graphModel'

export interface GraphGame {
  loading: boolean
  error: string | null
  document: Document | null
  nodes: Node[]
  edges: Edge[]
  questionsByNode: Map<string, Question[]>
  statusOf: (nodeId: string) => NodeStatus
  progressOf: (nodeId: string) => Progress | undefined
  summary: ProgressSummary
  /** Records one answer, persists counts and any state change, updates live. */
  recordAnswer: (nodeId: string, correct: boolean, nextState?: ProgressState) => Promise<void>
}

export function useGraphGame(documentId: string | undefined): GraphGame {
  const [document, setDocument] = useState<Document | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [questionsByNode, setQuestionsByNode] = useState<Map<string, Question[]>>(new Map())
  const [progressByNode, setProgressByNode] = useState<Map<string, Progress>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      if (!documentId) return
      setLoading(true)
      setError(null)
      try {
        const doc = await getDocument(supabase, documentId)
        if (!doc) throw new Error('That document was not found.')
        const [nodeRows, edgeRows] = await Promise.all([
          listNodesForDocument(supabase, documentId),
          listEdgesForDocument(supabase, documentId),
        ])
        const nodeIds = nodeRows.map((n) => n.id)
        const [questionRows, progressRows] = await Promise.all([
          listQuestionsForNodes(supabase, nodeIds),
          listProgressForNodes(supabase, nodeIds),
        ])
        if (!active) return
        const qMap = new Map<string, Question[]>()
        for (const q of questionRows) {
          const list = qMap.get(q.node_id) ?? []
          list.push(q)
          qMap.set(q.node_id, list)
        }
        setDocument(doc)
        setNodes(nodeRows)
        setEdges(edgeRows)
        setQuestionsByNode(qMap)
        setProgressByNode(new Map(progressRows.map((p) => [p.node_id, p])))
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Could not load this map.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [documentId])

  const starting = useMemo(() => startingNodeIds(nodes, edges), [nodes, edges])
  const adjacency = useMemo(() => buildAdjacency(edges), [edges])
  const masteredSet = useMemo(() => {
    const set = new Set<string>()
    for (const p of progressByNode.values()) if (p.state === 'mastered') set.add(p.node_id)
    return set
  }, [progressByNode])

  const statusOf = useCallback(
    (nodeId: string): NodeStatus => {
      const state = progressByNode.get(nodeId)?.state ?? 'fogged'
      return deriveStatus(nodeId, state, starting, masteredSet, adjacency)
    },
    [progressByNode, starting, masteredSet, adjacency],
  )

  const progressOf = useCallback((nodeId: string) => progressByNode.get(nodeId), [progressByNode])

  const summary = useMemo(() => summarize(progressByNode, nodes.length), [progressByNode, nodes])

  const recordAnswer = useCallback(
    async (nodeId: string, correct: boolean, nextState?: ProgressState) => {
      const current = progressByNode.get(nodeId)
      if (!current) return
      const updated: Progress = {
        ...current,
        attempt_count: current.attempt_count + 1,
        correct_count: current.correct_count + (correct ? 1 : 0),
        state: nextState ?? current.state,
        last_reviewed_at: new Date().toISOString(),
      }
      // Optimistic: update the graph and fog immediately.
      setProgressByNode((prev) => new Map(prev).set(nodeId, updated))
      try {
        await updateProgress(supabase, current.id, {
          attempt_count: updated.attempt_count,
          correct_count: updated.correct_count,
          state: updated.state,
          last_reviewed_at: updated.last_reviewed_at,
        })
      } catch (err) {
        // Roll back the optimistic change so the UI matches the database.
        setProgressByNode((prev) => new Map(prev).set(nodeId, current))
        throw err instanceof Error ? err : new Error('Could not save your progress.')
      }
    },
    [progressByNode],
  )

  return {
    loading,
    error,
    document,
    nodes,
    edges,
    questionsByNode,
    statusOf,
    progressOf,
    summary,
    recordAnswer,
  }
}
