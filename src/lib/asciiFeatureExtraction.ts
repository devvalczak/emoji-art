import { monospaceFontStack } from './asciiFont'
import { createCanvas, get2dContext } from './canvasUtil'
import { rgbToLab } from './colorSpace'
import { SHAPE_GRID_SIZE, type EmojiFeatureVector } from './types'

const RENDER_SIZE = 64
const BLOCK = RENDER_SIZE / SHAPE_GRID_SIZE

interface AsciiGlyphStats {
  avgColorLab: [number, number, number]
  /**
   * Flattened SHAPE_GRID_SIZE x SHAPE_GRID_SIZE grid, values in 0..1, where
   * 1 = no ink in that block and 0 = fully inked — inverted so it lines up
   * with sampleImageBlocks.ts's luminance convention (bright image regions
   * are high, dark/detailed regions are low). Every glyph is drawn in the
   * same flat ink color (see drawText below), so unlike emoji, per-pixel
   * luminance of the ink itself carries no shape information here — only
   * alpha coverage per block does.
   */
  shapeGrid: Float32Array
  /** Fraction of the render box covered by non-transparent ink, 0..1. */
  coverage: number
}

function renderAsciiGlyphStats(char: string, fontWeight: 'normal' | 'bold'): AsciiGlyphStats {
  const canvas = createCanvas(RENDER_SIZE, RENDER_SIZE)
  const ctx = get2dContext(canvas)
  ctx.font = `${fontWeight} ${RENDER_SIZE * 0.85}px ${monospaceFontStack()}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(char, RENDER_SIZE / 2, RENDER_SIZE / 2 + RENDER_SIZE * 0.05)

  const { data } = ctx.getImageData(0, 0, RENDER_SIZE, RENDER_SIZE)

  let alphaSum = 0
  let rSum = 0
  let gSum = 0
  let bSum = 0
  const shapeGrid = new Float32Array(SHAPE_GRID_SIZE * SHAPE_GRID_SIZE)

  for (let gy = 0; gy < SHAPE_GRID_SIZE; gy++) {
    for (let gx = 0; gx < SHAPE_GRID_SIZE; gx++) {
      let blockAlphaSum = 0
      for (let y = 0; y < BLOCK; y++) {
        for (let x = 0; x < BLOCK; x++) {
          const px = gx * BLOCK + x
          const py = gy * BLOCK + y
          const idx = (py * RENDER_SIZE + px) * 4
          const r = data[idx]
          const g = data[idx + 1]
          const b = data[idx + 2]
          const a = data[idx + 3] / 255
          alphaSum += a
          rSum += r * a
          gSum += g * a
          bSum += b * a
          blockAlphaSum += a
        }
      }
      shapeGrid[gy * SHAPE_GRID_SIZE + gx] = 1 - blockAlphaSum / (BLOCK * BLOCK)
    }
  }

  const avgColorLab: [number, number, number] =
    alphaSum > 0 ? rgbToLab(rSum / alphaSum, gSum / alphaSum, bSum / alphaSum) : [0, 0, 0]

  return { avgColorLab, shapeGrid, coverage: alphaSum / (RENDER_SIZE * RENDER_SIZE) }
}

/** Feature vector for a single ASCII character, in the same shape used for emoji matching (see matcher.ts). */
export function extractAsciiCharFeatures(
  char: string,
  fontWeight: 'normal' | 'bold',
): EmojiFeatureVector {
  const { avgColorLab, shapeGrid } = renderAsciiGlyphStats(char, fontWeight)
  return { id: char, avgColorLab, shapeGrid }
}

/** How much of the glyph's render box is covered by ink, used to order a density ramp from lightest to darkest. */
export function measureInkCoverage(char: string, fontWeight: 'normal' | 'bold'): number {
  return renderAsciiGlyphStats(char, fontWeight).coverage
}
