import type { AsciiSettings } from './types'

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

/** Applies contrast/brightness/gamma/invert to a single 0..1 luminance sample. */
export function adjustLuminance(
  l: number,
  settings: Pick<AsciiSettings, 'contrast' | 'brightness' | 'gamma' | 'invert'>,
): number {
  const contrastFactor = (100 + settings.contrast) / 100
  let v = (l - 0.5) * contrastFactor + 0.5 + settings.brightness / 200
  v = clamp01(v)
  v = Math.pow(v, 1 / settings.gamma)
  if (settings.invert) v = 1 - v
  return clamp01(v)
}

/** Rounds each 0..1 value independently to one of `levels` buckets (no error diffusion). */
export function quantizeToLevels(luminance: Float32Array, levels: number): Uint8Array {
  const maxIndex = Math.max(0, levels - 1)
  const result = new Uint8Array(luminance.length)
  for (let i = 0; i < luminance.length; i++) {
    result[i] = Math.round(clamp01(luminance[i]) * maxIndex)
  }
  return result
}

/**
 * Floyd-Steinberg error diffusion, quantizing each value in `luminance`
 * (row-major, cols x rows) to one of `levels` buckets while propagating
 * quantization error to not-yet-visited neighbors. Needs the whole 2D grid
 * at once, unlike the per-cell-independent matcher used for emoji/bestfit.
 */
export function ditherToLevels(
  luminance: Float32Array,
  cols: number,
  rows: number,
  levels: number,
): Uint8Array {
  const maxIndex = Math.max(0, levels - 1)
  const buf = Float32Array.from(luminance)
  const result = new Uint8Array(luminance.length)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col
      const old = clamp01(buf[i])
      const levelIndex = maxIndex > 0 ? Math.round(old * maxIndex) : 0
      result[i] = levelIndex
      const quantized = maxIndex > 0 ? levelIndex / maxIndex : 0
      const err = old - quantized

      if (col + 1 < cols) buf[i + 1] += (err * 7) / 16
      if (row + 1 < rows) {
        if (col > 0) buf[i + cols - 1] += (err * 3) / 16
        buf[i + cols] += (err * 5) / 16
        if (col + 1 < cols) buf[i + cols + 1] += (err * 1) / 16
      }
    }
  }
  return result
}

interface SobelCell {
  magnitude: number
  gx: number
  gy: number
}

/** Sobel gradient over a 2D grid of 0..1 values, using clamped edge sampling at the border. */
export function computeSobelEdges(values: Float32Array, cols: number, rows: number): SobelCell[] {
  const at = (c: number, r: number) => {
    const cc = Math.min(cols - 1, Math.max(0, c))
    const rr = Math.min(rows - 1, Math.max(0, r))
    return values[rr * cols + cc]
  }
  const result: SobelCell[] = new Array(cols * rows)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const gx =
        -at(col - 1, row - 1) +
        at(col + 1, row - 1) -
        2 * at(col - 1, row) +
        2 * at(col + 1, row) -
        at(col - 1, row + 1) +
        at(col + 1, row + 1)
      const gy =
        -at(col - 1, row - 1) -
        2 * at(col, row - 1) -
        at(col + 1, row - 1) +
        at(col - 1, row + 1) +
        2 * at(col, row + 1) +
        at(col + 1, row + 1)
      // Divide by 4 so magnitude lands roughly in 0..1.4 for typical images, comparable to edgeThreshold's 0..1 range.
      result[row * cols + col] = { magnitude: Math.sqrt(gx * gx + gy * gy) / 4, gx, gy }
    }
  }
  return result
}

/** Picks a directional line character for the contour perpendicular to the given gradient. */
export function pickEdgeChar(gx: number, gy: number): string {
  const gradientAngle = Math.atan2(gy, gx)
  let edgeAngle = gradientAngle + Math.PI / 2
  edgeAngle = ((edgeAngle % Math.PI) + Math.PI) % Math.PI
  if (edgeAngle < Math.PI / 8 || edgeAngle >= (7 * Math.PI) / 8) return '-'
  if (edgeAngle < (3 * Math.PI) / 8) return '/'
  if (edgeAngle < (5 * Math.PI) / 8) return '|'
  return '\\'
}

/**
 * Maps a grid of raw per-cell 0..1 luminance samples to characters from
 * `ramp` (ordered least to most ink), applying contrast/brightness/gamma/
 * invert, optional Floyd-Steinberg dithering, and an optional edge-detection
 * overlay. `ramp` must be non-empty.
 */
export function generateDensityGrid(
  luminance: Float32Array,
  cols: number,
  rows: number,
  settings: AsciiSettings,
  ramp: string[],
): string[] {
  const adjusted = new Float32Array(luminance.length)
  for (let i = 0; i < luminance.length; i++) {
    adjusted[i] = adjustLuminance(luminance[i], settings)
  }

  const levelIndices = settings.dither
    ? ditherToLevels(adjusted, cols, rows, ramp.length)
    : quantizeToLevels(adjusted, ramp.length)

  const maxRampIndex = ramp.length - 1
  const chars = new Array<string>(luminance.length)
  for (let i = 0; i < luminance.length; i++) {
    // Darker cells get more ink; brighter cells get less.
    chars[i] = ramp[maxRampIndex - levelIndices[i]]
  }

  if (settings.edgeOverlay) {
    const edges = computeSobelEdges(adjusted, cols, rows)
    for (let i = 0; i < chars.length; i++) {
      if (edges[i].magnitude >= settings.edgeThreshold) {
        chars[i] = pickEdgeChar(edges[i].gx, edges[i].gy)
      }
    }
  }

  return chars
}
