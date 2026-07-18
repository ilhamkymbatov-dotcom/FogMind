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

type AsLink = CommonProps & { to: string; href?: undefined } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
>
type AsExternal = CommonProps & { href: string; to?: undefined } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
>
type AsButton = CommonProps & { to?: undefined; href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>

export type ButtonProps = AsLink | AsExternal | AsButton

function classes(variant: ButtonVariant, size: ButtonSize, className?: string): string {
  return [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ')
}

/**
 * On a marketing site most calls to action navigate, so the same component
 * renders a router Link for an in app path (`to`), a plain anchor for an
 * external URL (`href`, e.g. the product app), and a button otherwise.
 *
 * The data-fog-clear marker lets the site wide fog layer carve a hole so it
 * never veils a control the user is meant to click.
 */
export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', className } = props

  if (props.to !== undefined) {
    const { to, variant: _v, size: _s, className: _c, children, ...rest } = props
    return (
      <Link to={to} className={classes(variant, size, className)} data-fog-clear {...rest}>
        {children}
      </Link>
    )
  }

  if (props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children, ...rest } = props
    return (
      <a href={href} className={classes(variant, size, className)} data-fog-clear {...rest}>
        {children}
      </a>
    )
  }

  const { variant: _v, size: _s, className: _c, children, type = 'button', ...rest } = props
  return (
    <button type={type} className={classes(variant, size, className)} data-fog-clear {...rest}>
      {children}
    </button>
  )
}
