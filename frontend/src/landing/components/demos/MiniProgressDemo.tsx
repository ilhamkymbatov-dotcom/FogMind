import { useTranslation } from '../../../i18n'
import { useDemoLoop } from './useDemoLoop'
import styles from './MiniProgressDemo.module.css'

/*
 * Mastery spreading across a map. Each loop step masters one more node, and the
 * summary line uses the very same string the document view shows, so the demo
 * and the product read identically.
 *
 * The last step is every node mastered at 100 percent, which is what reduced
 * motion holds.
 */

const W = 260
const H = 170
const ux = (x: number) => `${(x / W) * 100}%`
const uy = (y: number) => `${(y / H) * 100}%`
const uw = (v: number) => `${(v / W) * 100}%`

interface ProgressNode {
  x: number
  y: number
  r: number
  /** Position in the spreading order. */
  order: number
}

const NODES: readonly ProgressNode[] = [
  { x: 130, y: 132, r: 11, order: 1 },
  { x: 62, y: 88, r: 10, order: 2 },
  { x: 196, y: 86, r: 10, order: 3 },
  { x: 32, y: 38, r: 8, order: 4 },
  { x: 124, y: 32, r: 8, order: 5 },
  { x: 226, y: 34, r: 8, order: 6 },
]

const EDGES: readonly [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 5],
]

const TOTAL = NODES.length
const STEPS = TOTAL + 1

export function MiniProgressDemo() {
  const { t } = useTranslation()
  const { ref, step, reduced } = useDemoLoop(STEPS, 1000)

  const mastered = step
  const percent = Math.round((mastered / TOTAL) * 100)

  return (
    <div
      ref={ref}
      className={[styles.wrap, reduced ? styles.still : ''].filter(Boolean).join(' ')}
    >
      <div className={styles.scene} aria-hidden="true">
        <div className={styles.stage}>
          {EDGES.map(([a, b]) => {
            const from = NODES[a]
            const to = NODES[b]
            const dx = to.x - from.x
            const dy = to.y - from.y
            const length = Math.hypot(dx, dy)
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI
            const on = mastered >= to.order
            return (
              <span
                key={`${a}-${b}`}
                className={[styles.edge, on ? styles.edgeOn : ''].filter(Boolean).join(' ')}
                style={{
                  left: ux(from.x),
                  top: uy(from.y),
                  width: uw(length),
                  transform: `rotate(${angle}deg)`,
                }}
              />
            )
          })}
          {NODES.map((node, i) => {
            const on = mastered >= node.order
            return (
              <span
                key={i}
                className={[styles.node, on ? styles.nodeOn : ''].filter(Boolean).join(' ')}
                style={{ left: ux(node.x), top: uy(node.y), width: uw(node.r * 2) }}
              />
            )
          })}
        </div>
      </div>

      <div className={styles.readout}>
        <span className={styles.summary}>
          {t('detail.summary', { mastered, total: TOTAL, percent })}
        </span>
        <span className={styles.track}>
          <span className={styles.fill} style={{ width: `${percent}%` }} />
        </span>
      </div>
    </div>
  )
}
