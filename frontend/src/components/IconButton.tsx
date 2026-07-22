import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import styles from './IconButton.module.css'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: LucideIcon
  /** Names the action. Used as the accessible name and as the tooltip text. */
  label: string
  /** Danger tints the icon on hover, for actions that cannot be undone. */
  tone?: 'quiet' | 'danger'
  /** Which side the tooltip opens on, so it never runs off a card edge. */
  tipAlign?: 'start' | 'end'
}

/**
 * A small icon only control.
 *
 * The icon is deliberately understated so it does not compete with the content
 * it sits beside, but the button around it is a full 44px, so the target is
 * comfortable even though the mark is 16px. The label is both the accessible
 * name and the tooltip, which keeps the two from drifting apart.
 *
 * The tooltip is a styled element rather than the title attribute, because
 * title never appears on keyboard focus. This one shows on hover and on focus
 * alike, so the meaning is reachable without a pointer.
 */
export function IconButton({
  icon: Icon,
  label,
  tone = 'quiet',
  tipAlign = 'end',
  className,
  ...rest
}: IconButtonProps) {
  return (
    <span className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <button
        type="button"
        className={[styles.button, tone === 'danger' ? styles.danger : ''].filter(Boolean).join(' ')}
        aria-label={label}
        {...rest}
      >
        <Icon size={16} aria-hidden="true" />
      </button>
      <span
        className={[styles.tip, tipAlign === 'start' ? styles.tipStart : styles.tipEnd].join(' ')}
        role="presentation"
        aria-hidden="true"
      >
        {label}
      </span>
    </span>
  )
}
