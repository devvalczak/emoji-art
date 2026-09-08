import { luminance01, rgbToLab } from './colorSpace'
import { drawEmoji } from './emojiStyles'
import { SHAPE_GRID_SIZE, type EmojiFeatureVector, type StyleId } from './types'

const RENDER_SIZE = 64
const BLOCK = RENDER_SIZE / SHAPE_GRID_SIZE

export async function extractEmojiFeatures(
  emoji: string,
  styleId: StyleId,
): Promise<EmojiFeatureVector> {
  const canvas = document.createElement('canvas')
  canvas.width = RENDER_SIZE
  canvas.height = RENDER_SIZE
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Canvas 2D nie jest dostępny.')

  await drawEmoji(ctx, emoji, styleId, RENDER_SIZE)
  const { data } = ctx.getImageData(0, 0, RENDER_SIZE, RENDER_SIZE)

  let alphaSum = 0
  let rSum = 0
  let gSum = 0
  let bSum = 0
  const shapeGrid = new Float32Array(SHAPE_GRID_SIZE * SHAPE_GRID_SIZE)

  for (let gy = 0; gy < SHAPE_GRID_SIZE; gy++) {
    for (let gx = 0; gx < SHAPE_GRID_SIZE; gx++) {
      let blockLumSum = 0
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
          blockLumSum += luminance01(r, g, b) * a
        }
      }
      shapeGrid[gy * SHAPE_GRID_SIZE + gx] = blockLumSum / (BLOCK * BLOCK)
    }
  }

  const avgColorLab: [number, number, number] =
    alphaSum > 0 ? rgbToLab(rSum / alphaSum, gSum / alphaSum, bSum / alphaSum) : [0, 0, 0]

  return { id: emoji, avgColorLab, shapeGrid }
}
