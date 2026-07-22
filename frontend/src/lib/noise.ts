/**
 * Tileable Perlin noise, baked into canvas tiles.
 *
 * The fog needs organic structure that drifts forever without ever showing a
 * seam or a repeat pop. Evaluating noise per pixel per frame would be far too
 * expensive, so instead the noise is baked once into a small seamless tile and
 * then drawn as a repeating pattern that is translated and scaled every frame.
 * Several tiles at different scales and drift speeds stack into fractal cloud.
 *
 * Seamlessness comes from a periodic lattice: the gradient table is indexed
 * modulo the octave period, so the field wraps exactly at the tile edge.
 */

const GRADIENTS: ReadonlyArray<readonly [number, number]> = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

/** Deterministic shuffle, so a given seed always paints the same cloud. */
function makePermutation(seed: number): Uint8Array {
  const base = new Uint8Array(256)
  for (let i = 0; i < 256; i++) base[i] = i

  // A small xorshift is plenty for shuffling a 256 entry table.
  let state = (seed | 0) || 1
  const next = () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return (state >>> 0) / 4294967296
  }
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    const tmp = base[i]
    base[i] = base[j]
    base[j] = tmp
  }

  // Doubled, so lattice lookups never need a bounds check.
  const perm = new Uint8Array(512)
  for (let i = 0; i < 512; i++) perm[i] = base[i & 255]
  return perm
}

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function dotGradient(hash: number, x: number, y: number): number {
  const g = GRADIENTS[hash & 7]
  return g[0] * x + g[1] * y
}

/**
 * Perlin gradient noise on a lattice that repeats every `period` cells, so a
 * tile sampled across exactly `period` cells joins itself on all four sides.
 * Returns roughly -1..1.
 */
function periodicNoise(x: number, y: number, period: number, perm: Uint8Array): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi

  const x0 = ((xi % period) + period) % period
  const y0 = ((yi % period) + period) % period
  const x1 = (x0 + 1) % period
  const y1 = (y0 + 1) % period

  const u = fade(xf)
  const v = fade(yf)

  const n00 = dotGradient(perm[perm[x0] + y0], xf, yf)
  const n10 = dotGradient(perm[perm[x1] + y0], xf - 1, yf)
  const n01 = dotGradient(perm[perm[x0] + y1], xf, yf - 1)
  const n11 = dotGradient(perm[perm[x1] + y1], xf - 1, yf - 1)

  // 1.4 lifts the gradient noise range close to the full -1..1.
  return lerp(lerp(n00, n10, u), lerp(n01, n11, u), v) * 1.4
}

export interface NoiseTileOptions {
  /** Tile edge in pixels. A power of two keeps the pattern scaling crisp. */
  size: number
  /** Lattice cells across the tile at the first octave. Larger means finer. */
  period: number
  octaves: number
  seed: number
  /**
   * Ridged turbulence folds the field at zero, which turns smooth billows into
   * the thin filaments and wisps that read as torn mist.
   */
  ridged?: boolean
  /** Exponent on the 0..1 field. Above 1 darkens and separates the masses. */
  contrast?: number
  /** Colour of the tile. The noise itself lives in the alpha channel. */
  rgb: readonly [number, number, number]
  /** Peak alpha, 0..1. */
  alpha: number
}

/**
 * Bakes one seamless fractal noise tile. Called a handful of times at startup
 * and never again, so the per frame cost of the fog is only pattern fills.
 */
export function bakeNoiseTile(options: NoiseTileOptions): HTMLCanvasElement {
  const { size, period, octaves, seed, ridged = false, contrast = 1, rgb, alpha } = options
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  const perm = makePermutation(seed)
  const image = ctx.createImageData(size, size)
  const data = image.data
  const [r, g, b] = rgb

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let sum = 0
      let norm = 0
      let amplitude = 1

      for (let o = 0; o < octaves; o++) {
        // Each octave doubles the lattice period alongside the sample rate, so
        // every octave tiles at the same edge and the sum tiles too.
        const p = period * (1 << o)
        const n = periodicNoise((x / size) * p, (y / size) * p, p, perm)
        sum += amplitude * (ridged ? 1 - Math.abs(n) : n)
        norm += amplitude
        amplitude *= 0.5
      }

      let field = sum / norm
      if (!ridged) field = (field + 1) / 2
      field = Math.min(1, Math.max(0, field))
      if (contrast !== 1) field = Math.pow(field, contrast)

      const i = (y * size + x) * 4
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
      data[i + 3] = Math.round(field * alpha * 255)
    }
  }

  ctx.putImageData(image, 0, 0)
  return canvas
}
