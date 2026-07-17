import { useId, type InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, id, className, type = 'text', ...rest }: InputProps) {
  // Falls back to a generated id so the label always has something to point at,
  // while still letting a caller supply its own.
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={styles.field}>
      {label ? (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        type={type}
        className={[styles.input, className].filter(Boolean).join(' ')}
        {...rest}
      />
    </div>
  )
}
