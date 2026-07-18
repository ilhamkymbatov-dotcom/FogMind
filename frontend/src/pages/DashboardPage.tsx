import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Waypoints } from 'lucide-react'
import { countNodes, listDocumentsForUser, type Document, type DocumentStatus } from '@fogmind/backend'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/Button'
import { UploadModal } from '../components/UploadModal'
import styles from './DashboardPage.module.css'

interface DocumentRow extends Document {
  nodeCount: number
}

const STATUS_LABEL: Record<DocumentStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  ready: 'Ready',
  failed: 'Failed',
}

const SOURCE_LABEL: Record<string, string> = {
  pdf: 'PDF',
  docx: 'DOCX',
  markdown: 'Markdown',
  text: 'Text',
}

function StatusBadge({ status }: { status: DocumentStatus }) {
  const cls = [
    styles.badge,
    status === 'ready' ? styles.badgeReady : '',
    status === 'failed' ? styles.badgeFailed : '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <span className={cls}>
      <span className={styles.dot} aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [rows, setRows] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const docs = await listDocumentsForUser(supabase, user.id)
      const withCounts = await Promise.all(
        docs.map(async (doc) => ({ ...doc, nodeCount: await countNodes(supabase, doc.id) })),
      )
      setRows(withCounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your documents.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>Signed in as {user?.email}</p>
          <h1 className={styles.title}>Your knowledge maps</h1>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          className={styles.uploadButton}
          onClick={() => setUploadOpen(true)}
        >
          Upload
        </Button>
      </div>

      {loading ? (
        <p className={styles.state}>Loading your documents</p>
      ) : error ? (
        <div className={styles.error} role="alert">
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className={styles.empty}>
          <Waypoints className={styles.emptyIcon} size={32} aria-hidden="true" />
          <h2 className={styles.emptyTitle}>No maps yet</h2>
          <p className={styles.emptyBody}>
            Upload a PDF, DOCX, Markdown or text file, or paste your notes, to build your first
            knowledge map.
          </p>
          <Button variant="primary" icon={Plus} onClick={() => setUploadOpen(true)}>
            Upload
          </Button>
        </div>
      ) : (
        <div className={styles.list}>
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              className={styles.row}
              onClick={() => navigate(`/app/documents/${row.id}`)}
            >
              <div className={styles.rowMain}>
                <div className={styles.rowTitle}>{row.title}</div>
                <div className={styles.rowMeta}>
                  {SOURCE_LABEL[row.source_type] ?? row.source_type} · {row.nodeCount} nodes ·{' '}
                  {formatDate(row.created_at)}
                </div>
              </div>
              <div className={styles.rowRight}>
                <StatusBadge status={row.status} />
              </div>
            </button>
          ))}
        </div>
      )}

      {uploadOpen ? (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onComplete={(result) => {
            setUploadOpen(false)
            navigate(`/app/documents/${result.document.id}`)
          }}
        />
      ) : null}
    </div>
  )
}

export default DashboardPage
