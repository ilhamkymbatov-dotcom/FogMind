import { useEffect, useMemo, useRef } from 'react'
import { CARD_REACH, type NodeStatus, type Point, type Transform } from '../../lib/graphModel'
import { bakeNoiseTile } from '../../lib/noise'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export interface FogNode {
  id: string
  point: Point
  status: NodeStatus
}

export interface FogBranch {
  from: Point
  to: Point
  key: string
}

interface FogLayersInput {
  width: number
  height: number
  transform: Transform
  nodes: FogNode[]
  branches: FogBranch[]
}

/** How far the mist thins around a node, in graph units. */
const CLEAR_RADIUS: Record<NodeStatus, number> = {
  locked: 0,
  available: 185,
  completed: 215,
  mastered: 235,
}

/** Reach strength before the noise tears at it. */
const CLEAR_STRENGTH: Record<NodeStatus, number> = {
  locked: 0,
  available: 0.94,
  completed: 1,
  mastered: 1,
}

/**
 * The fraction of the reach that stays solid no matter what the noise does.
 * Everything outside it is free to tear and dissolve; everything inside it is
 * the part a card's text sits on, so it is restamped after the erosion.
 */
const CORE_FRACTION = 0.62

const BRANCH_WIDTH = 96
const SWEEP_MS = 700
const TILE = 256

/** Rendering at roughly half resolution. Cloud has no edges to soften. */
const RES = 0.55

interface Layer {
  tile: HTMLCanvasElement
  /** Tile pixels per canvas pixel. Larger means bigger, softer masses. */
  scale: number
  vx: number
  vy: number
  alpha: number
  /** How much this layer slides with a pan, as a fraction. Gives parallax. */
  parallax: number
}

/**
 * The lantern. Cleared ground is lit warm, which against the cold blue of the
 * mist is what makes the map read as somewhere with a temperature rather than
 * a gray sheet. Used only as light inside the canvas, never as a UI colour.
 */
const WARM = '255, 208, 150'

interface Mote {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  alpha: number
}

const frac = (v: number) => v - Math.floor(v)
/** A cheap fixed hash, so every speck keeps its place between frames. */
const spread = (i: number, salt: number) => frac(Math.sin(i * 12.9898 + salt) * 43758.5453)

/** Dust turning in the lantern light. */
const MOTES: Mote[] = Array.from({ length: 40 }, (_, i) => ({
  x: spread(i, 0),
  y: spread(i, 1.7),
  r: 0.6 + spread(i, 3.1) * 1.1,
  vx: (spread(i, 5.3) - 0.5) * 0.012,
  vy: -0.006 - spread(i, 7.9) * 0.012,
  alpha: 0.3 + spread(i, 9.4) * 0.4,
}))

interface Star {
  x: number
  y: number
  r: number
  alpha: number
  /** Offsets the twinkle so the field does not breathe in unison. */
  phase: number
}

/** Distant stars, seen only where the mist is thin and the ground unexplored. */
const STARS: Star[] = Array.from({ length: 90 }, (_, i) => ({
  x: spread(i, 21.3),
  y: spread(i, 33.7),
  r: 0.5 + spread(i, 41.1) * 0.9,
  alpha: 0.25 + spread(i, 55.5) * 0.6,
  phase: spread(i, 67.2) * Math.PI * 2,
}))

const wrap01 = (v: number) => ((v % 1) + 1) % 1

/**
 * Paints the map's weather across two canvases that sandwich the node cards, so
 * the graph sits inside a volume of cloud rather than under a gray sheet.
 *
 * Both layers are the same idea: a base wash plus several tiles of seamless
 * fractal Perlin noise, each at its own scale, drift speed and parallax, which
 * stack into billowing fractal structure. The back layer is a slow, pale haze
 * that passes behind the cards along with a soft key light and drifting dust.
 * The front layer is the dense weather that actually hides the map.
 *
 * Clearing is built as a separate mask and then punched out of both layers. The
 * mask is a soft reach around each cleared node, eroded by a drifting noise
 * tile so the boundary tears and dissolves instead of stamping a circle, then
 * sharpened and finally restamped with a solid core, which is what guarantees a
 * card's text is never sitting under mottle.
 *
 * One requestAnimationFrame drives everything and reads the latest props from a
 * ref, so it never restarts on a React render. It stops when the tab is hidden
 * or the map scrolls out of view. Reduced motion paints a single still frame
 * that keeps all of the texture and none of the movement.
 */
export function useFogLayers({ width, height, transform, nodes, branches }: FogLayersInput) {
  const backRef = useRef<HTMLCanvasElement>(null)
  const frontRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  const latest = useRef({ transform, nodes, branches })
  latest.current = { transform, nodes, branches }
  const branchStart = useRef(new Map<string, number>())

  // Baked once for the life of the page. Grayscale only, as the fog is the one
  // place the product allows itself no colour at all.
  const tiles = useMemo(
    () => ({
      // The dark cold body of the mist, which is what swallows unexplored
      // ground. Nearly black, and blue rather than gray.
      body: bakeNoiseTile({ size: TILE, period: 2, octaves: 5, seed: 1337, contrast: 1.3, rgb: [7, 12, 26], alpha: 0.92 }),
      // Billow tops catching what light there is. Cool, never white.
      light: bakeNoiseTile({ size: TILE, period: 3, octaves: 5, seed: 90210, contrast: 1.6, rgb: [104, 128, 170], alpha: 0.62 }),
      // Thin filaments, the wisps that sell it as vapour rather than paint.
      wisp: bakeNoiseTile({ size: TILE, period: 5, octaves: 4, seed: 5150, ridged: true, contrast: 3, rgb: [158, 186, 226], alpha: 0.4 }),
      // The chisel that eats irregular bites out of the clearing boundary.
      // Mostly dark with scattered bright teeth, so it takes bites rather than
      // thinning everything evenly, and fine grained so the teeth land on the
      // rim of a pocket instead of swallowing the whole thing.
      tear: bakeNoiseTile({ size: TILE, period: 4, octaves: 4, seed: 24601, contrast: 2.1, rgb: [0, 0, 0], alpha: 1 }),
    }),
    [],
  )

  useEffect(() => {
    const back = backRef.current
    const front = frontRef.current
    if (!back || !front || width === 0 || height === 0) return

    const backCtx = back.getContext('2d')
    const frontCtx = front.getContext('2d')
    if (!backCtx || !frontCtx) return

    const w = Math.max(1, Math.round(width * RES))
    const h = Math.max(1, Math.round(height * RES))
    for (const canvas of [back, front]) {
      canvas.width = w
      canvas.height = h
    }

    // The clearing mask. Built fresh each frame, never shown directly.
    const mask = document.createElement('canvas')
    mask.width = w
    mask.height = h
    const maskCtx = mask.getContext('2d')
    if (!maskCtx) return

    // Weighted toward the dark tile on purpose. What survives the punch is all
    // that is left inside a pocket, and a white haze over a white card would
    // survive as nothing at all, which is how a pocket ends up a bare disc.
    const backLayers: Layer[] = [
      { tile: tiles.body, scale: 4.6, vx: 4, vy: -2, alpha: 0.46, parallax: 0.18 },
      { tile: tiles.body, scale: 1.7, vx: 6.2, vy: -3.1, alpha: 0.26, parallax: 0.14 },
      { tile: tiles.light, scale: 3.2, vx: -2.6, vy: -1.4, alpha: 0.16, parallax: 0.18 },
    ]
    const frontLayers: Layer[] = [
      { tile: tiles.body, scale: 3.2, vx: 3.4, vy: -1.8, alpha: 0.6, parallax: 0.07 },
      { tile: tiles.light, scale: 1.9, vx: -5.2, vy: -2.8, alpha: 0.52, parallax: 0.07 },
      { tile: tiles.body, scale: 1.15, vx: 6.4, vy: -3.6, alpha: 0.3, parallax: 0.05 },
      { tile: tiles.wisp, scale: 1.1, vx: 9, vy: -5, alpha: 0.3, parallax: 0.035 },
    ]

    // A pattern belongs to the context that made it, so they are cached per
    // context as well as per tile. Made once, then only retransformed.
    const patterns = new Map<CanvasRenderingContext2D, Map<HTMLCanvasElement, CanvasPattern>>()
    const patternFor = (tile: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      let forCtx = patterns.get(ctx)
      if (!forCtx) {
        forCtx = new Map()
        patterns.set(ctx, forCtx)
      }
      const found = forCtx.get(tile)
      if (found) return found
      const made = ctx.createPattern(tile, 'repeat')
      if (made) forCtx.set(tile, made)
      return made
    }

    /**
     * Fills the canvas with one repeating tile, offset and scaled.
     *
     * The scale and offset go on the pattern rather than on the context, so the
     * fill is always exactly the canvas: putting them on the context would mean
     * a large scale layer painting many times the visible area to cover it.
     * The offset is taken modulo the tile footprint, so the drift runs forever
     * with no seam, no jump and no loss of float precision.
     */
    const paintTile = (
      ctx: CanvasRenderingContext2D,
      tile: HTMLCanvasElement,
      scale: number,
      alpha: number,
      dx: number,
      dy: number,
    ) => {
      const p = patternFor(tile, ctx)
      if (!p) return
      const span = TILE * scale
      const ox = ((dx % span) + span) % span
      const oy = ((dy % span) + span) % span
      p.setTransform(new DOMMatrix([scale, 0, 0, scale, ox - span, oy - span]))
      ctx.globalAlpha = alpha
      ctx.fillStyle = p
      ctx.fillRect(0, 0, w, h)
      ctx.globalAlpha = 1
    }

    const paintLayer = (ctx: CanvasRenderingContext2D, layer: Layer, seconds: number, pan: Transform) =>
      paintTile(
        ctx,
        layer.tile,
        layer.scale,
        layer.alpha,
        layer.vx * seconds + pan.x * RES * layer.parallax,
        layer.vy * seconds + pan.y * RES * layer.parallax,
      )

    /** The soft reach of a clearing, before the noise gets at it. */
    const reach = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, strength: number) => {
      if (radius <= 0) return
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      g.addColorStop(0, `rgba(255, 255, 255, ${strength})`)
      g.addColorStop(0.45, `rgba(255, 255, 255, ${strength * 0.92})`)
      g.addColorStop(0.75, `rgba(255, 255, 255, ${strength * 0.44})`)
      g.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    /**
     * The part that must stay legible whatever the noise does to the rim.
     * `solid` is the radius that comes out fully clear; past it the stamp
     * feathers off so it blends into the torn boundary rather than adding an
     * edge of its own.
     */
    const core = (ctx: CanvasRenderingContext2D, cx: number, cy: number, solid: number) => {
      if (solid <= 0) return
      const outer = solid * 1.25
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, outer)
      g.addColorStop(0, 'rgba(255, 255, 255, 1)')
      g.addColorStop(solid / outer, 'rgba(255, 255, 255, 1)')
      g.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, outer, 0, Math.PI * 2)
      ctx.fill()
    }

    const buildMask = (now: number, seconds: number, t: Transform, fogNodes: FogNode[], fogBranches: FogBranch[]) => {
      const c = maskCtx
      c.setTransform(1, 0, 0, 1, 0, 0)
      c.globalCompositeOperation = 'source-over'
      c.globalAlpha = 1
      c.clearRect(0, 0, w, h)

      const toScreen = (p: Point) => ({ x: (p.x * t.k + t.x) * RES, y: (p.y * t.k + t.y) * RES })

      // 1. Reach, node pockets and the capsule that sweeps along a branch.
      for (const node of fogNodes) {
        const radius = CLEAR_RADIUS[node.status]
        if (radius <= 0) continue
        const p = toScreen(node.point)
        reach(c, p.x, p.y, radius * t.k * RES, CLEAR_STRENGTH[node.status])
      }
      // The capsule along a branch is three round capped strokes of decreasing
      // width, which feathers much like a gradient would but costs three draws
      // instead of one per step down the line.
      c.lineCap = 'round'
      c.lineJoin = 'round'
      const capsule = BRANCH_WIDTH * t.k * RES
      for (const branch of fogBranches) {
        if (!branchStart.current.has(branch.key)) branchStart.current.set(branch.key, now)
        const started = branchStart.current.get(branch.key) as number
        const progress = reduced ? 1 : Math.min(1, (now - started) / SWEEP_MS)
        const from = toScreen(branch.from)
        const to = toScreen(branch.to)
        for (const [scale, alpha] of [
          [1, 0.3],
          [0.68, 0.34],
          [0.4, 0.5],
        ]) {
          c.strokeStyle = `rgba(255, 255, 255, ${alpha})`
          c.lineWidth = capsule * scale
          c.beginPath()
          c.moveTo(from.x, from.y)
          c.lineTo(from.x + (to.x - from.x) * progress, from.y + (to.y - from.y) * progress)
          c.stroke()
        }
      }

      // 2. Firm it up. Compositing the mask over itself lifts the long soft
      //    falloff into something with a real body, which gives the noise in
      //    the next step an edge worth biting instead of a smudge.
      c.globalCompositeOperation = 'source-over'
      c.globalAlpha = 1
      c.drawImage(mask, 0, 0)

      // 3. Erode, twice. The coarse pass pulls the pocket out of round into
      //    lobes; the fine pass chews teeth into the boundary. Both tiles drift
      //    on their own, so the fog keeps tearing and re knitting at the edges.
      c.globalCompositeOperation = 'destination-out'
      const bite = (scale: number, alpha: number, vx: number, vy: number) =>
        paintTile(c, tiles.tear, scale, alpha, seconds * vx + t.x * RES * 0.06, seconds * vy + t.y * RES * 0.06)
      bite(0.75, 0.78, 2.6, -1.5)
      bite(0.33, 0.72, 5.5, -3.4)

      // 4. Restamp the readable cores. Back to drawing, not erasing. Never
      //    smaller than the card itself, so the guarantee holds whatever the
      //    noise did and however long the title runs.
      c.globalCompositeOperation = 'source-over'
      c.globalAlpha = 1
      for (const node of fogNodes) {
        const radius = CLEAR_RADIUS[node.status]
        if (radius <= 0) continue
        const p2 = toScreen(node.point)
        core(c, p2.x, p2.y, Math.max(radius * CORE_FRACTION, CARD_REACH) * t.k * RES)
      }
    }

    /** Screen position of a node under the current pan and zoom. */
    const screenOf = (node: FogNode, t: Transform) => ({
      x: (node.point.x * t.k + t.x) * RES,
      y: (node.point.y * t.k + t.y) * RES,
    })

    /** How lit a point is, 1 at the heart of a clearing and 0 out in the cold. */
    const litness = (x: number, y: number, lit: FogNode[], t: Transform, spreadBy = 1) => {
      let near = 0
      for (const node of lit) {
        const radius = CLEAR_RADIUS[node.status] * spreadBy * t.k * RES
        if (radius <= 0) continue
        const p = screenOf(node, t)
        const d = Math.hypot(x - p.x, y - p.y)
        if (d < radius) near = Math.max(near, 1 - d / radius)
      }
      return near
    }

    /**
     * The lantern pools. Warm light spilling from every clearing, which is the
     * whole temperature story: warm where the learner has been, cold where the
     * map is still shut.
     */
    const paintLanterns = (ctx: CanvasRenderingContext2D, t: Transform, lit: FogNode[], peak: number, reachBy: number) => {
      for (const node of lit) {
        const radius = CLEAR_RADIUS[node.status] * reachBy * t.k * RES
        if (radius <= 0) continue
        const p = screenOf(node, t)
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius)
        g.addColorStop(0, `rgba(${WARM}, ${peak})`)
        g.addColorStop(0.42, `rgba(${WARM}, ${peak * 0.44})`)
        g.addColorStop(0.72, `rgba(${WARM}, ${peak * 0.15})`)
        g.addColorStop(1, `rgba(${WARM}, 0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    /** Dust turning in the lantern light. Warm, and only where the air is clear. */
    const paintDust = (ctx: CanvasRenderingContext2D, seconds: number, t: Transform, lit: FogNode[]) => {
      if (lit.length === 0) return
      ctx.fillStyle = `rgba(${WARM}, 1)`
      for (const mote of MOTES) {
        const x = wrap01(mote.x + mote.vx * seconds) * w
        const y = wrap01(mote.y + mote.vy * seconds) * h
        const near = litness(x, y, lit, t)
        if (near <= 0.02) continue
        ctx.globalAlpha = mote.alpha * near * 0.7
        ctx.beginPath()
        ctx.arc(x, y, mote.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    /**
     * Distant stars. They belong to the cold unexplored half of the map, so
     * they fade out as a clearing approaches, where the lantern would drown
     * them anyway. They drift with the map rather than the screen, which is
     * what makes the dark read as a place rather than an overlay.
     */
    const paintStars = (ctx: CanvasRenderingContext2D, seconds: number, t: Transform, lit: FogNode[]) => {
      ctx.fillStyle = 'rgba(206, 222, 250, 1)'
      for (let i = 0; i < STARS.length; i++) {
        const star = STARS[i]
        const x = wrap01(star.x + t.x * RES * 0.00018) * w
        const y = wrap01(star.y + t.y * RES * 0.00018) * h
        const dark = 1 - litness(x, y, lit, t, 1.3)
        if (dark <= 0.03) continue
        const twinkle = 0.72 + 0.28 * Math.sin(seconds * 0.7 + star.phase)
        ctx.globalAlpha = star.alpha * dark * twinkle
        ctx.beginPath()
        ctx.arc(x, y, star.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    let raf = 0
    let running = true
    let visible = true

    const render = (now: number) => {
      const { transform: t, nodes: fogNodes, branches: fogBranches } = latest.current
      const seconds = reduced ? 8.4 : now / 1000

      buildMask(now, seconds, t, fogNodes, fogBranches)

      const lit = fogNodes.filter((n) => CLEAR_RADIUS[n.status] > 0)

      // Back: the lit atmosphere behind the cards. The deep ground colour is
      // the wrap's own background, so this layer only adds to it.
      // The first fill copies rather than draws, which replaces the previous
      // frame outright and saves clearing the canvas first.
      backCtx.setTransform(1, 0, 0, 1, 0, 0)
      backCtx.globalAlpha = 1
      backCtx.globalCompositeOperation = 'copy'
      backCtx.fillStyle = 'rgba(12, 19, 36, 0.34)'
      backCtx.fillRect(0, 0, w, h)
      backCtx.globalCompositeOperation = 'source-over'
      for (const layer of backLayers) paintLayer(backCtx, layer, seconds, t)
      // Thin the cold haze where the map is open, then pour the warm light in
      // after, so the punch never eats the lantern.
      backCtx.globalCompositeOperation = 'destination-out'
      backCtx.globalAlpha = 0.72
      backCtx.drawImage(mask, 0, 0)
      backCtx.globalCompositeOperation = 'source-over'
      backCtx.globalAlpha = 1
      paintStars(backCtx, seconds, t, lit)
      // Light adds, it does not cover. Painted normally over the dark haze the
      // lantern comes out as brown sludge; added to it, it glows. This one is
      // the soft spill past the clearing, which fog would carry anyway.
      backCtx.globalCompositeOperation = 'lighter'
      paintLanterns(backCtx, t, lit, 0.46, 1.45)
      backCtx.globalCompositeOperation = 'source-over'

      // Front: the cold weather that actually hides the map.
      frontCtx.setTransform(1, 0, 0, 1, 0, 0)
      frontCtx.globalAlpha = 1
      frontCtx.globalCompositeOperation = 'copy'
      frontCtx.fillStyle = 'rgba(9, 15, 30, 0.55)'
      frontCtx.fillRect(0, 0, w, h)
      frontCtx.globalCompositeOperation = 'source-over'
      for (const layer of frontLayers) paintLayer(frontCtx, layer, seconds, t)
      // Mist close to a clearing catches the lantern. Drawn with source-atop so
      // it only tints vapour that is already there and never thickens the air
      // over open ground.
      frontCtx.globalCompositeOperation = 'source-atop'
      paintLanterns(frontCtx, t, lit, 0.36, 1.3)
      frontCtx.globalCompositeOperation = 'destination-out'
      frontCtx.globalAlpha = 1
      frontCtx.drawImage(mask, 0, 0)

      // Both punches are done, so the mask is free to be reused as the shape of
      // the lantern itself. Recolouring it in place gives warm light with the
      // clearing's own torn, dissolving edge, instead of a smooth disc of glow
      // sitting over it and quietly undoing all that tearing.
      // One flat fill through the mask, not one gradient per node: repeating
      // source-in would multiply the lanterns into each other and dim the whole
      // field. The mask's own falloff is the falloff.
      const m = maskCtx
      m.globalCompositeOperation = 'source-in'
      m.globalAlpha = 1
      m.fillStyle = `rgba(${WARM}, 1)`
      m.fillRect(0, 0, w, h)
      backCtx.globalCompositeOperation = 'lighter'
      backCtx.globalAlpha = 0.2
      backCtx.drawImage(mask, 0, 0)
      backCtx.globalAlpha = 1
      backCtx.globalCompositeOperation = 'source-over'
      paintDust(backCtx, seconds, t, lit)

      if (running && visible && !reduced) raf = requestAnimationFrame(render)
    }

    // Paint once up front. Waiting for the first animation frame would show a
    // bare, unfogged map for a beat on mount and after every resize.
    render(performance.now())
    raf = requestAnimationFrame(render)

    const resume = () => {
      if (reduced || running) return
      running = true
      raf = requestAnimationFrame(render)
    }
    const pause = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const onVisibility = () => {
      if (document.hidden) pause()
      else if (visible) resume()
    }
    document.addEventListener('visibilitychange', onVisibility)

    // Nothing to animate while the map is scrolled away. A browser that never
    // reports back leaves `visible` true, so the fog runs rather than stalls.
    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting)
        if (visible && !document.hidden) resume()
        else pause()
      },
      { threshold: 0 },
    )
    observer.observe(front)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
      observer.disconnect()
    }
  }, [width, height, reduced, tiles])

  return { backRef, frontRef }
}
