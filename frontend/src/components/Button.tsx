import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** A lucide-react icon component, rendered before the label. */
  icon?: LucideIcon
  children: ReactNode
}

const ICON_SIZE: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...rest}>
      {Icon ? <Icon className={styles.icon} size={ICON_SIZE[size]} aria-hidden="true" /> : null}
      {children}
    </button>
  )
}
