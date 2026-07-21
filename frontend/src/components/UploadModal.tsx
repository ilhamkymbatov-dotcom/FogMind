import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Upload, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { errorKey, useTranslation, type TranslationKey } from '../i18n'
import { extractFromFile, extractedFromPastedText, ExtractionError } from '../lib/extractText'
import { ingest, type IngestResult } from '../lib/ingest'
import { Button } from './Button'
import { Input } from './Input'
import styles from './UploadModal.module.css'

type Mode = 'file' | 'paste'

interface UploadModalProps {
  onClose: () => void
  onComplete: (result: IngestResult) => void
}

function defaultTitle(fileName: string): string {
  const dot = fileName.lastIndexOf('.')
  return dot === -1 ? fileName : fileName.slice(0, dot)
}

export function UploadModal({ onClose, onComplete }: UploadModalProps) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('file')
  const [file, setFile] = useState<File | null>(null)
  const [pasteText, setPasteText] = useState('')
  const [title, setTitle] = useState('')
  const [working, setWorking] = useState(false)
  const [statusKey, setStatusKey] = useState<TranslationKey | null>(null)
  const [error, setError] = useState<TranslationKey | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !working) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, working])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0] ?? null
    setFile(picked)
    setError(null)
    if (picked && !title.trim()) setTitle(defaultTitle(picked.name))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!user) {
      setError('auth.err.sessionExpired')
      return
    }
    if (!title.trim()) {
      setError('upload.errTitle')
      return
    }
    if (mode === 'file' && !file) {
      setError('upload.errChooseFile')
      return
    }
    if (mode === 'paste' && !pasteText.trim()) {
      setError('upload.errPasteText')
      return
    }

    setWorking(true)
    try {
      setStatusKey('upload.statusReading')
      const extracted =
        mode === 'file' && file
          ? await extractFromFile(file)
          : extractedFromPastedText(pasteText)

      if (!extracted.text.trim()) {
        throw new ExtractionError('upload.errEmpty')
      }

      setStatusKey('upload.statusBuilding')
      const result = await ingest({
        userId: user.id,
        title: title.trim(),
        sourceType: extracted.sourceType,
        text: extracted.text,
      })
      onComplete(result)
    } catch (err) {
      setError(errorKey(err))
      setWorking(false)
    }
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={t('upload.title')}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !working) onClose()
      }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('upload.title')}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label={t('common.close')} disabled={working}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'file'}
            className={[styles.tab, mode === 'file' ? styles.tabActive : ''].filter(Boolean).join(' ')}
            onClick={() => setMode('file')}
            disabled={working}
          >
            {t('upload.tabFile')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'paste'}
            className={[styles.tab, mode === 'paste' ? styles.tabActive : ''].filter(Boolean).join(' ')}
            onClick={() => setMode('paste')}
            disabled={working}
          >
            {t('upload.tabPaste')}
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {mode === 'file' ? (
            <>
              <button
                type="button"
                className={styles.dropzone}
                onClick={() => fileInputRef.current?.click()}
                disabled={working}
              >
                <Upload className={styles.dropzoneIcon} size={24} aria-hidden="true" />
                {file ? (
                  <span className={styles.fileName}>{file.name}</span>
                ) : (
                  <span>{t('upload.dropzone')}</span>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.md,.txt"
                className={styles.hiddenInput}
                onChange={handleFileChange}
              />
            </>
          ) : (
            <textarea
              className={styles.textarea}
              placeholder={t('upload.pastePlaceholder')}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              disabled={working}
            />
          )}

          <Input
            label={t('upload.titleLabel')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('upload.titlePlaceholder')}
            disabled={working}
            required
          />

          {error ? (
            <div className={styles.error} role="alert">
              {t(error)}
            </div>
          ) : null}

          {working && statusKey ? (
            <div className={styles.status} role="status" aria-live="polite">
              <span className={styles.spinner} aria-hidden="true" />
              {t(statusKey)}
            </div>
          ) : null}

          <Button type="submit" variant="primary" className={styles.submit} disabled={working}>
            {working ? t('upload.working') : t('upload.submit')}
          </Button>
        </form>
      </div>
    </div>
  )
}
