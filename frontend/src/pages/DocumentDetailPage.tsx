import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import {
  countEdges,
  countQuestionsForNodes,
  getDocument,
  listNodesForDocument,
  type Document,
} from '@fogmind/backend'
import { supabase } from '../lib/supabase'
import styles from './DocumentDetailPage.module.css'

interface Detail {
  document: Document
  nodes: number
  edges: number
  questions: number
}

const SOURCE_LABEL: Record<string, string> = {
  pdf: 'PDF',
  docx: 'DOCX',
  markdown: 'Markdown',
  text: 'Text',
}

function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const document = await getDocument(supabase, id)
        if (!document) throw new Error('That document was not found.')
        const nodes = await listNodesForDocument(supabase, id)
        const [edges, questions] = await Promise.all([
          countEdges(supabase, id),
          countQuestionsForNodes(
            supabase,
            nodes.map((n) => n.id),
          ),
        ])
        if (active) setDetail({ document, nodes: nodes.length, edges, questions })
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Could not load this document.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [id])

  return (
    <div className={styles.page}>
      <Link to="/app" className={styles.back}>
        <ChevronLeft size={16} aria-hidden="true" />
        All maps
      </Link>

      {loading ? (
        <p className={styles.state}>Loading</p>
      ) : error ? (
        <div className={styles.error} role="alert">
          {error}
        </div>
      ) : detail ? (
        <>
          <h1 className={styles.title}>{detail.document.title}</h1>
          <p className={styles.meta}>
            {SOURCE_LABEL[detail.document.source_type] ?? detail.document.source_type} · Status{' '}
            {detail.document.status}
          </p>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>{detail.nodes}</div>
              <div className={styles.statLabel}>Nodes</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{detail.edges}</div>
              <div className={styles.statLabel}>Connections</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{detail.questions}</div>
              <div className={styles.statLabel}>Questions</div>
            </div>
          </div>
          <p className={styles.note}>
            The interactive map and the fog clearing review arrive in the next phase.
          </p>
        </>
      ) : null}
    </div>
  )
}

export default DocumentDetailPage
