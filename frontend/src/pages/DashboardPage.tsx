import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useState as useReactState } from 'react'
import { Plus, Trash2, Waypoints } from 'lucide-react'
import {
  countNodes,
  deleteDocument,
  listDocumentsForUser,
  type Document,
  type DocumentStatus,
} from '@fogmind/backend'
import { useAuth } from '../context/AuthContext'
import { errorKey, useTranslation, type TranslationKey } from '../i18n'
import { supabase } from '../lib/supabase'
import { Button } from '../components/Button'
import { UploadModal } from '../components/UploadModal'
import { StreakCard } from '../components/StreakCard'
import { IconButton } from '../components/IconButton'
import { ConfirmDialog } from '../components/ConfirmDialog'
import styles from './DashboardPage.module.css'

interface DocumentRow extends Document {
  nodeCount: number
}

const STATUS_KEY: Record<DocumentStatus, TranslationKey> = {
  pending: 'status.pending',
  processing: 'status.processing',
  ready: 'status.ready',
  failed: 'status.failed',
}

// PDF, DOCX and Markdown are names kept as is; plain text is translated.
function sourceLabel(source: string, t: (k: TranslationKey) => string): string {
  if (source === 'pdf') return 'PDF'
  if (source === 'docx') return 'DOCX'
  if (source === 'markdown') return 'Markdown'
  if (source === 'text') return t('source.text')
  return source
}

function StatusBadge({ status }: { status: DocumentStatus }) {
  const { t } = useTranslation()
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
      {t(STATUS_KEY[status])}
    </span>
  )
}

function DashboardPage() {
  const { user } = useAuth()
  const { t, lang } = useTranslation()
  const navigate = useNavigate()
  const [rows, setRows] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<TranslationKey | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useReactState<DocumentRow | null>(null)

  const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString(lang, { year: 'numeric', month: 'short', day: 'numeric' })

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
      setError(errorKey(err))
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
          <p className={styles.greeting}>{t('dash.signedInAs', { email: user?.email ?? '' })}</p>
          <h1 className={styles.title}>{t('dash.title')}</h1>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          className={styles.uploadButton}
          onClick={() => setUploadOpen(true)}
        >
          {t('dash.upload')}
        </Button>
      </div>

      <StreakCard />

      {loading ? (
        <p className={styles.state}>{t('dash.loading')}</p>
      ) : error ? (
        <div className={styles.error} role="alert">
          {t(error)}
        </div>
      ) : rows.length === 0 ? (
        <div className={styles.empty}>
          <Waypoints className={styles.emptyIcon} size={32} aria-hidden="true" />
          <h2 className={styles.emptyTitle}>{t('dash.emptyTitle')}</h2>
          <p className={styles.emptyBody}>{t('dash.emptyBody')}</p>
          <Button variant="primary" icon={Plus} onClick={() => setUploadOpen(true)}>
            {t('dash.upload')}
          </Button>
        </div>
      ) : (
        <div className={styles.list}>
          {rows.map((row) => (
            <div key={row.id} className={styles.row}>
              <button
                type="button"
                className={styles.rowOpen}
                onClick={() => navigate(`/app/documents/${row.id}`)}
              >
                <div className={styles.rowMain}>
                  <div className={styles.rowTitle}>{row.title}</div>
                  <div className={styles.rowMeta}>
                    {t('dash.rowMeta', {
                      source: sourceLabel(row.source_type, t),
                      count: row.nodeCount,
                      date: formatDate(row.created_at),
                    })}
                  </div>
                </div>
              </button>
              <div className={styles.rowRight}>
                <StatusBadge status={row.status} />
                {/* Tucked past the status, so it is never on the way to
                    opening the map. */}
                <IconButton
                  icon={Trash2}
                  tone="danger"
                  label={t('doc.delete')}
                  onClick={() => setPendingDelete(row)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingDelete ? (
        <ConfirmDialog
          titleKey="doc.deleteTitle"
          body={<p>{t('doc.deleteBody', { title: pendingDelete.title })}</p>}
          confirmKey="doc.deleteConfirm"
          workingKey="doc.deleting"
          onConfirm={async () => {
            await deleteDocument(supabase, pendingDelete.id)
            // Drop it locally rather than refetching, so the card leaves at the
            // moment the delete lands.
            setRows((prev) => prev.filter((r) => r.id !== pendingDelete.id))
            setPendingDelete(null)
          }}
          onClose={() => setPendingDelete(null)}
        />
      ) : null}

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
