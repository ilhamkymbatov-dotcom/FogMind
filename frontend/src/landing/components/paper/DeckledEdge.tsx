import styles from './DeckledEdge.module.css'

/*
 * A torn paper edge, used where a section boundary would otherwise be a ruled
 * line. The path is hand authored rather than generated: the peaks are uneven
 * in both height and spacing, because an evenly sampled wave reads immediately
 * as a machine and defeats the point.
 *
 * The shape is filled with the colour of the section it tears away from, so the
 * two rooms meet along a fibrous edge instead of a straight one.
 */

/** Deliberately irregular. Do not smooth or regularise these numbers. */
const TEAR =
  'M0 0 H1200 V13.2 C1176 10.4 1150 16.8 1122 12.1 C1094 7.6 1068 15.9 1040 11.2 ' +
  'C1012 6.9 986 14.4 958 10.8 C930 7.4 902 16.2 874 12.6 C846 9.1 818 15.1 790 10.4 ' +
  'C762 6.2 736 14.8 708 11.9 C680 9.2 652 16.4 624 12.8 C596 9.3 570 15.6 542 11.1 ' +
  'C514 6.8 486 14.2 458 10.6 C430 7.2 404 16.1 376 12.4 C348 8.8 320 14.9 292 10.2 ' +
  'C264 5.9 238 15.2 210 11.6 C182 8.1 154 16.6 126 12.9 C98 9.4 70 14.1 42 10.7 ' +
  'C28 9 14 12.4 0 9.8 Z'

interface DeckledEdgeProps {
  /** Any CSS colour. Should match the section the tear is peeling away from. */
  color: string
  /** Which end of the section the edge sits on. */
  side?: 'top' | 'bottom'
}

export function DeckledEdge({ color, side = 'top' }: DeckledEdgeProps) {
  return (
    <span
      className={[styles.edge, side === 'bottom' ? styles.bottom : styles.top].join(' ')}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1200 20" preserveAspectRatio="none" className={styles.svg}>
        <path d={TEAR} fill={color} />
      </svg>
    </span>
  )
}
