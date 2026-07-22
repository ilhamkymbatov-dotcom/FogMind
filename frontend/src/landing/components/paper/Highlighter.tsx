import { motion } from 'framer-motion'
import { useStaticReveal } from '../motion/Surface'
import styles from './Highlighter.module.css'

/*
 * A highlighter stroke that sweeps across one phrase as the heading arrives,
 * the way somebody marks the sentence that matters in a textbook.
 *
 * The phrase is passed separately rather than marked up inside the string, so
 * translators keep one clean sentence per language and simply name the words
 * they would have highlighted. If the phrase is not found in the text, which is
 * exactly what a slightly reworded translation will cause, the heading renders
 * untouched rather than breaking.
 *
 * The stroke sits behind the words at a low alpha, so the marked text keeps the
 * contrast it had before.
 */

interface HighlighterProps {
  text: string
  /** The words to mark. Must appear in `text` verbatim to take effect. */
  phrase: string
  delay?: number
}

export function Highlighter({ text, phrase, delay = 0 }: HighlighterProps) {
  const isStatic = useStaticReveal()
  const at = phrase ? text.indexOf(phrase) : -1

  if (at === -1) return <>{text}</>

  const before = text.slice(0, at)
  const marked = text.slice(at, at + phrase.length)
  const after = text.slice(at + phrase.length)

  return (
    <>
      {before}
      <span className={styles.wrap}>
        {isStatic ? (
          <span className={styles.stroke} aria-hidden="true" />
        ) : (
          <motion.span
            className={styles.stroke}
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false, margin: '-14% 0px -18% 0px' }}
            transition={{ duration: 0.68, delay, ease: [0.32, 0.1, 0.2, 1] }}
          />
        )}
        <span className={styles.text}>{marked}</span>
      </span>
      {after}
    </>
  )
}
