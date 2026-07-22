import styles from './MarginNote.module.css'

/**
 * A small numbered note of the kind that ends up in a margin: a circled figure
 * and a few words in a lighter hand than the body. Positioned by the page that
 * uses it, since where a note belongs depends on what it is annotating.
 */
export function MarginNote({ n, text, className }: { n: number; text: string; className?: string }) {
  return (
    <aside className={[styles.note, className].filter(Boolean).join(' ')}>
      <span className={styles.number} aria-hidden="true">
        {n}
      </span>
      <span className={styles.text}>{text}</span>
    </aside>
  )
}
