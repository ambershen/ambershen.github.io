export function terrainNoise(x: number, y: number): number {
  const hash = (a: number, b: number) => { const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return n - Math.floor(n) }
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy)
  return (hash(ix, iy) * (1 - u) + hash(ix + 1, iy) * u) * (1 - v) + (hash(ix, iy + 1) * (1 - u) + hash(ix + 1, iy + 1) * u) * v
}

/** Four sample points within a cell (cells are centred on integer coordinates), for edge coverage. */
const SAMPLES: [number, number][] = [[-.25, -.25], [.25, -.25], [-.25, .25], [.25, .25]]

/** Heights are material units. Local downhill transfers conserve sand volume. */
export class SandSurface {
  readonly levels: Float32Array
  readonly base: Float32Array
  readonly compact: Float32Array
  readonly disturbed: Float32Array
  protected resting = 0
  protected pass = 0
  /**
   * How far the surface leans, as a mural stands on a wall (0 lies flat). Loose sand, what is piled
   * above the dune, then settles to a gentler face below (down the screen, +y) than above.
   */
  gravity = 0
  constructor(readonly width: number, readonly height: number, readonly snow = false) {
    this.levels = new Float32Array(width * height)
    this.base = new Float32Array(width * height)
    this.compact = new Float32Array(width * height)
    this.disturbed = new Float32Array(width * height)
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      // Long smooth dunes leave the untouched surface quiet enough to draw on.
      const scale = Math.max(width, height)
      const u = x / scale, v = y / scale
      const broad = terrainNoise(u * 3.1 + 4.7, v * 3.1 + 2.3)
      const shoulder = terrainNoise(u * 5.2 + 11.2, v * 5.2 + 7.8)
      // Localized rounded hills, not continuous bands across the whole screen.
      const nx = x / width, ny = y / height
      const hill = (cx: number, cy: number, rx: number, ry: number, height: number) => {
        const a = (nx - cx) / rx, b = (ny - cy) / ry
        const curved = b + .22 * a * a
        return height * Math.exp(-(a * a + curved * curved) * 1.6)
      }
      this.base[y * width + x] = snow
        ? 1.25 + broad * .09
        : .94 + hill(.25, .31, .38, .38, 1.35)
          + hill(.78, .60, .35, .43, 1.45)
          + hill(.18, .95, .40, .29, .60)
          + hill(.51, .46, .26, .24, .16) + broad * .10 + shoulder * .025
    }
    this.reset()
  }
  reset() { this.levels.set(this.base); this.compact.fill(0); this.disturbed.fill(0); this.resting = 0 }
  /**
   * Slide the whole surface `n` cells to the left, as a scroll is unrolled: what was drawn travels
   * with the sand, and fresh untouched ground, `ground(x, y)`, comes in on the right.
   */
  slide(n: number, ground: (x: number, y: number) => number) {
    const w = this.width
    n = Math.min(w, Math.max(0, Math.floor(n)))
    if (!n) return
    // One copy per field moves every row at once; the cells it wraps into each row's end are refilled.
    for (const field of [this.levels, this.base, this.compact, this.disturbed]) field.copyWithin(0, n)
    for (let y = 0; y < this.height; y++) for (let x = w - n; x < w; x++) {
      const i = y * w + x, g = ground(x, y)
      this.base[i] = this.levels[i] = g; this.compact[i] = this.disturbed[i] = 0
    }
  }
  touch(x: number, y: number, radius: number, load = .4, amount = .65, motionX = 0, motionY = 0) {
    const r = Math.max(1.5, radius), outer = r * 2.8
    let removed = 0, weights = 0
    const deposits: number[] = [], values: number[] = []
    const center = Math.min(this.levels.length - 1, Math.max(0, Math.round(y) * this.width + Math.round(x)))
    const depth = .13 + Math.min(1, load) * .20
    const motionLength = Math.hypot(motionX, motionY)
    const dirX = motionLength > .001 ? motionX / motionLength : 0
    const dirY = motionLength > .001 ? motionY / motionLength : 0
    for (let py = Math.max(0, Math.floor(y - outer)); py <= Math.min(this.height - 1, Math.ceil(y + outer)); py++) {
      for (let px = Math.max(0, Math.floor(x - outer)); px <= Math.min(this.width - 1, Math.ceil(x + outer)); px++) {
        const i = py * this.width + px, rough = terrainNoise(px * .8, py * .8)
        const d = Math.hypot(px - x, py - y) / (r * (.93 + rough * .14))
        if (d < 1) {
          // A firm shallow channel with a broad floor and softened narrow shoulders.
          const edge = Math.max(0, Math.min(1, (1 - d) / .30))
          const shape = edge * edge * (3 - 2 * edge), target = this.base[i] - depth * shape
          const take = Math.max(0, this.levels[i] - target) * Math.min(1, amount)
          this.levels[i] -= take; removed += take
          this.disturbed[i] = Math.min(1, this.disturbed[i] + shape * amount)
        } else if (d < 2.8) {
          // Most displaced sand piles at the sides; some is pushed ahead.
          // The downhill side receives more material, then relaxes under gravity.
          const length = Math.max(.001, Math.hypot(px - x, py - y))
          const along = ((px - x) * dirX + (py - y) * dirY) / length
          const side = motionLength > .001 ? .35 + (1 - along * along) * 1.4 + Math.max(0, along) * .45 : 1
          const downhill = Math.max(.35, Math.min(2.5, 1 + (this.base[center] - this.base[i]) * 5))
            * (1 + this.gravity * 40 * Math.max(-1, Math.min(1, (py - y) / outer)))
          const weight = Math.exp(-Math.pow((d - 1.75) / .60, 2)) * (.8 + rough * .4) * side * downhill
          deposits.push(i); values.push(weight); weights += weight
        }
      }
    }
    if (weights > 0) for (let k = 0; k < deposits.length; k++) {
      this.levels[deposits[k]] += removed * values[k] / weights
      this.disturbed[deposits[k]] = Math.min(1, this.disturbed[deposits[k]] + values[k] * .1)
    }
    this.resting = 4
  }
  /**
   * Press a flat-bottomed mould into the sand, as a sandcastle form is pressed: each cell the shape
   * covers sinks to `depth` below the dune (edge cells partway, for a clean edge); a little of the
   * displaced sand rises in a thin ridge just outside, the rest is packed down. Pressing a deeper
   * shape inside a shallower one leaves a stepped, terraced relief.
   */
  imprint(x0: number, y0: number, x1: number, y1: number, inside: (x: number, y: number) => boolean, depth: number, amount = .9) {
    const m = 3, ax = Math.max(0, Math.floor(x0) - m), ay = Math.max(0, Math.floor(y0) - m), bx = Math.min(this.width - 1, Math.ceil(x1) + m), by = Math.min(this.height - 1, Math.ceil(y1) + m)
    const w = bx - ax + 1, h = by - ay + 1
    if (w <= 0 || h <= 0) return
    const cover = new Float32Array(w * h)
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let c = 0
      for (const [ox, oy] of SAMPLES) if (inside(ax + x + ox, ay + y + oy)) c++
      cover[y * w + x] = c / SAMPLES.length
    }
    let removed = 0
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = cover[y * w + x]; if (!c) continue
      const px = ax + x, py = ay + y, i = py * this.width + px
      const target = this.base[i] - depth * c * (.94 + terrainNoise(px * .8, py * .8) * .12)
      const take = Math.max(0, this.levels[i] - target) * amount
      this.levels[i] -= take; removed += take
      this.disturbed[i] = Math.min(1, this.disturbed[i] + c * .35)
      if (this.snow) this.compact[i] = Math.min(1, this.compact[i] + c * .7)
    }
    // The ridge: uncovered cells within a few cells of the shape, heaviest just outside its edge.
    const ridge: number[] = [], weights: number[] = []
    let total = 0
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (cover[y * w + x]) continue
      let d = Infinity
      for (let dy = -m; dy <= m; dy++) for (let dx = -m; dx <= m; dx++) {
        const u = x + dx, v = y + dy
        if (u >= 0 && v >= 0 && u < w && v < h && cover[v * w + u]) d = Math.min(d, Math.hypot(dx, dy))
      }
      if (d > m) continue
      const weight = Math.exp(-(((d - 1.2) / .9) ** 2)); ridge.push((ay + y) * this.width + ax + x); weights.push(weight); total += weight
    }
    if (total > 0) for (let k = 0; k < ridge.length; k++) {
      this.levels[ridge[k]] += removed * .35 * weights[k] / total
      this.disturbed[ridge[k]] = Math.min(1, this.disturbed[ridge[k]] + weights[k] * .15)
    }
    this.resting = 4
  }
  settle(dt: number) {
    if (this.resting <= 0) return
    this.resting -= dt
    const rate = (1 - Math.exp(-Math.min(.05, dt) * (this.snow ? 14 : 11))) * .22
    const repose = this.snow ? .10 : .014
    const transfer = (a: number, b: number) => {
      const difference = this.levels[a] - this.levels[b]
      // Undisturbed hills are the resting bed. Only mobilized grains avalanche.
      if (!this.snow && Math.max(this.disturbed[a], this.disturbed[b]) < .015) return
      const bedSlope = this.snow ? 0 : Math.abs(this.base[a] - this.base[b])
      const excess = Math.abs(difference) - Math.max(repose, bedSlope * 1.05)
      if (excess <= 0) return
      const amount = Math.sign(difference) * excess * rate
      this.levels[a] -= amount; this.levels[b] += amount
      if (!this.snow) {
        const target = amount > 0 ? b : a
        this.disturbed[target] = Math.min(1, this.disturbed[target] + Math.abs(amount) * 3)
      }
    }
    // On a standing surface a pile holds a steeper face above than below: loose sand, what lies above
    // the dune, slides down until its lower face is gentler than `slip`, then stops. A rim becomes a
    // short apron under the line instead of running on down the screen.
    const g = this.gravity, slip = Math.max(.002, repose - g)
    const fall = (a: number, b: number) => {
      const loose = this.levels[a] - this.base[a]
      if (loose <= 0 || this.disturbed[a] < .015) return
      const lean = loose - (this.levels[b] - this.base[b])
      if (lean <= slip) return
      const amount = Math.min(loose, (lean - slip) * .5) * rate * 1.6
      this.levels[a] -= amount; this.levels[b] += amount
      this.disturbed[b] = Math.min(1, this.disturbed[b] + amount * 6)
    }
    const reverse = (this.pass++ % 2) !== 0
    for (let j = 0; j < this.levels.length; j++) {
      const i = reverse ? this.levels.length - j - 1 : j, x = i % this.width
      if (x + 1 < this.width) transfer(i, i + 1)
      if (i + this.width < this.levels.length) { transfer(i, i + this.width); if (g > 0) fall(i, i + this.width) }
    }
  }
}
