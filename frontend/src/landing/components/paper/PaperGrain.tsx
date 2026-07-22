import styles from './PaperGrain.module.css'

/**
 * A tooth of paper grain over a section.
 *
 * Fibre noise generated once by an SVG filter and tiled, laid over the wash at
 * a very low opacity so the surface stops reading as flat colour and starts
 * reading as stock. It is decorative and never takes input.
 *
 * Kept far below the contrast budget: the noise is a light grey multiplied over
 * an already light wash, so the effective darkening on any pixel is well under
 * the headroom the washes were tuned with.
 */
export function PaperGrain({ strength = 1 }: { strength?: number }) {
  return (
    <span
      className={styles.grain}
      style={{ opacity: 0.055 * strength }}
      aria-hidden="true"
    />
  )
}
