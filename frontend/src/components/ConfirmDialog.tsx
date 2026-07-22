import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useTranslation, errorKey, type TranslationKey } from '../i18n'
import { Button } from './Button'
import styles from './ConfirmDialog.module.css'

interface ConfirmDialogProps {
  titleKey: TranslationKey
  /** The explanation. Usually names the thing being acted on. */
  body: ReactNode
  confirmKey: TranslationKey
  /** Shown on the confirm button while the action runs. */
  workingKey: TranslationKey
  onConfirm: () => Promise<void>
  onClose: () => void
}

/**
 * A confirmation for something that cannot be undone.
 *
 * Deliberately a real modal rather than an inline toggle: it takes the focus,
 * dims what is behind it and cannot be dismissed by scrolling past. Escape and
 * the backdrop both cancel, focus is trapped while it is open and returned to
 * whatever opened it on close, and the confirm button reports its own progress
 * so a slow delete never looks like a dead click.
 *
 * While the action is running every exit is closed off, because cancelling
 * halfway through would leave the caller unsure whether it had happened.
 */
export function ConfirmDialog({
  titleKey,
  body,
  confirmKey,
  workingKey,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<TranslationKey | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const bodyId = useId()

  // Whatever had focus when this opened, so it can be handed back.
  const openerRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    // Start on confirm: it is the reason the dialog is here, and Escape is
    // always one key away. Found by marker rather than by ref, so the shared
    // Button does not have to grow a ref just for this.
    panelRef.current?.querySelector<HTMLElement>('[data-confirm]')?.focus()
    return () => {
      openerRef.current?.focus()
    }
  }, [])

  const close = useCallback(() => {
    if (!working) onClose()
  }, [working, onClose])

  // Escape cancels, Tab is kept inside the panel.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const run = async () => {
    setWorking(true)
    setError(null)
    try {
      await onConfirm()
      // The caller closes on success, since it owns what happens next.
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
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onMouseDown={(event) => {
        // Only a press that both starts and ends on the backdrop dismisses, so
        // a drag that happens to finish outside the panel does not.
        if (event.target === event.currentTarget) close()
      }}
    >
      <div className={styles.panel} ref={panelRef}>
        <h2 className={styles.title} id={titleId}>
          {t(titleKey)}
        </h2>
        <div className={styles.body} id={bodyId}>
          {body}
          <p className={styles.warning}>{t('confirm.permanent')}</p>
        </div>

        {error ? (
          <p className={styles.error} role="alert">
            {t(error)}
          </p>
        ) : null}

        <div className={styles.actions}>
          <Button variant="secondary" onClick={close} disabled={working}>
            {t('confirm.cancel')}
          </Button>
          <Button
            data-confirm=""
            variant="primary"
            className={styles.destructive}
            onClick={() => void run()}
            disabled={working}
          >
            {working ? t(workingKey) : t(confirmKey)}
          </Button>
        </div>
      </div>
    </div>
  )
}
