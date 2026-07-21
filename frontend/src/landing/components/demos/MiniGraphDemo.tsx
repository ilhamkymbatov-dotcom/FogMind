import { useDemoLoop } from './useDemoLoop'
import styles from './MiniGraphDemo.module.css'

/*
 * A miniature of the real knowledge map, built from the same parts as the app:
 * round node cards, thin branches, and grayscale fog that thins locally.
 *
 * The 3D reads from layering rather than a 3D library. The stage carries a
 * perspective tilt and a slow camera drift; nodes and branches sit at different
 * translateZ depths so they scale and soften naturally; and the fog is a set of
 * blurred volumes placed both behind and in front of the nodes, so the mist has
 * real thickness and passes across the map rather than sitting flat on top.
 *
 * Geometry is authored in a 340 by 240 unit space and emitted as percentages.
 * The scene holds that same aspect ratio, so one unit maps to the same number
 * of pixels on both axes and the whole map scales cleanly to any width.
 */

const W = 340
const H = 240

const ux = (x: number) => `${(x / W) * 100}%`
const uy = (y: number) => `${(y / H) * 100}%`
const uw = (v: number) => `${(v / W) * 100}%`

interface DemoNode {
  id: string
  x: number
  y: number
  z: number
  r: number
  /** The loop step at which this node clears its fog and lights up. */
  litAt: number
}

const NODES: readonly DemoNode[] = [
  { id: 'root', x: 170, y: 196, z: 0, r: 13, litAt: 0 },
  { id: 'left', x: 84, y: 126, z: 34, r: 11, litAt: 1 },
  { id: 'right', x: 254, y: 124, z: -30, r: 11, litAt: 3 },
  { id: 'll', x: 38, y: 54, z: 58, r: 9, litAt: 2 },
  { id: 'lr', x: 126, y: 44, z: 18, r: 9, litAt: 2 },
  { id: 'rr', x: 286, y: 48, z: -52, r: 9, litAt: 3 },
]

const EDGES: readonly [string, string][] = [
  ['root', 'left'],
  ['root', 'right'],
  ['left', 'll'],
  ['left', 'lr'],
  ['right', 'rr'],
]

/** Fog volumes. Negative z sits behind the nodes, positive z drifts in front. */
interface FogVolume {
  x: number
  y: number
  z: number
  size: number
  /** Fades once the loop reaches this step. */
  clearAt: number
  /** Opacity before it clears. */
  weight: number
  drift: string
}

const FOG: readonly FogVolume[] = [
  { x: 170, y: 130, z: -90, size: 250, clearAt: 99, weight: 0.18, drift: styles.driftA },
  { x: 80, y: 130, z: 36, size: 190, clearAt: 1, weight: 0.46, drift: styles.driftB },
  { x: 80, y: 46, z: 74, size: 180, clearAt: 2, weight: 0.44, drift: styles.driftC },
  { x: 264, y: 92, z: -18, size: 210, clearAt: 3, weight: 0.45, drift: styles.driftB },
  { x: 200, y: 150, z: 96, size: 240, clearAt: 99, weight: 0.16, drift: styles.driftC },
]

const STEPS = 5
const BY_ID = new Map(NODES.map((n) => [n.id, n]))

export function MiniGraphDemo() {
  const { ref, step, reduced } = useDemoLoop(STEPS, 1500)
  const mastered = step >= STEPS - 1

  return (
    <div
      ref={ref}
      className={[styles.scene, reduced ? styles.still : ''].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <div className={styles.stage}>
        {EDGES.map(([fromId, toId]) => {
          const from = BY_ID.get(fromId)
          const to = BY_ID.get(toId)
          if (!from || !to) return null
          const dx = to.x - from.x
          const dy = to.y - from.y
          const length = Math.hypot(dx, dy)
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI
          const open = step >= to.litAt
          return (
            <span
              key={`${fromId}-${toId}`}
              className={[styles.edge, open ? styles.edgeOpen : ''].filter(Boolean).join(' ')}
              style={{
                left: ux(from.x),
                top: uy(from.y),
                width: uw(length),
                transform: `translateZ(${(from.z + to.z) / 2}px) rotate(${angle}deg)`,
              }}
            />
          )
        })}

        {FOG.filter((f) => f.z < 0).map((fog, i) => (
          <FogBlob key={`back-${i}`} fog={fog} step={step} />
        ))}

        {NODES.map((node) => {
          const lit = step >= node.litAt
          return (
            <span
              key={node.id}
              className={[
                styles.node,
                lit ? styles.nodeLit : '',
                lit && mastered ? styles.nodeMastered : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                left: ux(node.x),
                top: uy(node.y),
                width: uw(node.r * 2),
                transform: `translate(-50%, -50%) translateZ(${node.z}px)`,
              }}
            />
          )
        })}

        {FOG.filter((f) => f.z >= 0).map((fog, i) => (
          <FogBlob key={`front-${i}`} fog={fog} step={step} />
        ))}
      </div>
    </div>
  )
}

function FogBlob({ fog, step }: { fog: FogVolume; step: number }) {
  const cleared = step >= fog.clearAt
  return (
    <span className={styles.fogLayer} style={{ transform: `translateZ(${fog.z}px)` }}>
      <span
        className={[styles.fogBlob, fog.drift].filter(Boolean).join(' ')}
        style={{
          left: ux(fog.x),
          top: uy(fog.y),
          width: uw(fog.size),
          opacity: cleared ? 0 : fog.weight,
        }}
      />
    </span>
  )
}
