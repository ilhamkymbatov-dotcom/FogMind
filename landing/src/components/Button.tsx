import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  className?: string
}

type AsLink = CommonProps & { to: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>
type AsButton = CommonProps & { to?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>

export type ButtonProps = AsLink | AsButton

function classes(variant: ButtonVariant, size: ButtonSize, className?: string): string {
  return [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ')
}

/**
 * On a marketing site most calls to action navigate, so the same component
 * renders a router Link when `to` is given and a plain button otherwise.
 */
export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', className } = props

  if (props.to !== undefined) {
    const { to, variant: _v, size: _s, className: _c, children, ...rest } = props
    return (
      <Link to={to} className={classes(variant, size, className)} {...rest}>
        {children}
      </Link>
    )
  }

  const { variant: _v, size: _s, className: _c, children, type = 'button', ...rest } = props
  return (
    <button type={type} className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  )
}
