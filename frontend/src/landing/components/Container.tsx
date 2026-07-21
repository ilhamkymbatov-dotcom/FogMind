import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import styles from './Container.module.css'

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Renders a different element, for cases where a div is not the right tag. */
  as?: ElementType
  children: ReactNode
}

export function Container({ as: Component = 'div', children, className, ...rest }: ContainerProps) {
  return (
    <Component className={[styles.container, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </Component>
  )
}
