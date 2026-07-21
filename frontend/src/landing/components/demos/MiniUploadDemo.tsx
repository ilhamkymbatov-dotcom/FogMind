import { FileText } from 'lucide-react'
import { useTranslation } from '../../../i18n'
import { useDemoLoop } from './useDemoLoop'
import styles from './MiniUploadDemo.module.css'

/*
 * The intake, end to end: a page of notes arrives, gets read line by line, and
 * the lines resolve into a small connected map. The sheet and the map occupy
 * the same space, so the page appears to become the graph rather than being
 * replaced by it.
 *
 * Steps: 0 the page arrives, 1 it is read, 2 the topics lift out, 3 they
 * connect, 4 the finished map holds (the reduced motion frame).
 */

const STEPS = 5
const LINES = [92, 76, 88, 64, 80, 54]

const W = 280
const H = 200
const ux = (x: number) => `${(x / W) * 100}%`
const uy = (y: number) => `${(y / H) * 100}%`
const uw = (v: number) => `${(v / W) * 100}%`

interface MapNode {
  x: number
  y: number
  r: number
  delay: number
}

const NODES: readonly MapNode[] = [
  { x: 140, y: 150, r: 12, delay: 0 },
  { x: 72, y: 96, r: 10, delay: 60 },
  { x: 208, y: 96, r: 10, delay: 120 },
  { x: 44, y: 44, r: 8, delay: 180 },
  { x: 138, y: 40, r: 8, delay: 240 },
  { x: 236, y: 42, r: 8, delay: 300 },
]

const EDGES: readonly [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 5],
]

export function MiniUploadDemo() {
  const { t } = useTranslation()
  const { ref, step, reduced } = useDemoLoop(STEPS, 1500)

  const reading = step === 1
  const lifting = step >= 2
  const connected = step >= 3

  return (
    <div
      ref={ref}
      className={[styles.scene, reduced ? styles.still : ''].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <div className={styles.stage}>
        {/* The page of notes. */}
        <div className={[styles.sheet, lifting ? styles.sheetGone : ''].filter(Boolean).join(' ')}>
          <div className={styles.sheetHead}>
            <FileText size={14} aria-hidden="true" />
            <span className={styles.sheetName}>{t('demo.upload.file')}</span>
          </div>
          <div className={styles.lines}>
            {LINES.map((width, i) => (
              <span
                key={i}
                className={[styles.line, reading ? styles.lineRead : ''].filter(Boolean).join(' ')}
                style={{ width: `${width}%`, transitionDelay: `${i * 70}ms` }}
              />
            ))}
          </div>
          {reading ? <span className={styles.scan} /> : null}
        </div>

        {/* The map the page becomes. */}
        <div className={[styles.map, lifting ? styles.mapIn : ''].filter(Boolean).join(' ')}>
          {EDGES.map(([a, b]) => {
            const from = NODES[a]
            const to = NODES[b]
            const dx = to.x - from.x
            const dy = to.y - from.y
            const length = Math.hypot(dx, dy)
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI
            return (
              <span
                key={`${a}-${b}`}
                className={[styles.edge, connected ? styles.edgeIn : ''].filter(Boolean).join(' ')}
                style={{
                  left: ux(from.x),
                  top: uy(from.y),
                  width: uw(length),
                  transform: `rotate(${angle}deg)`,
                  transitionDelay: `${to.delay}ms`,
                }}
              />
            )
          })}
          {NODES.map((node, i) => (
            <span
              key={i}
              className={styles.node}
              style={{
                left: ux(node.x),
                top: uy(node.y),
                width: uw(node.r * 2),
                transitionDelay: `${node.delay}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
