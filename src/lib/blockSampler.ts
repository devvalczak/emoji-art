import { luminance01, rgbToLab } from './colorSpace'
import type { CellFeature } from './matcher'
import { SHAPE_GRID_SIZE } from './types'

export interface CropRect {
  sx: number
  sy: number
  sw: number
  sh: number
}

/** Center-crop rectangle (in source image pixel coordinates) matching the given target aspect ratio (width/height). */
export function computeCenterCrop(
  imageWidth: number,
  imageHeight: number,
  targetAspect: number,
): CropRect {
  const sourceAspect = imageWidth / imageHeight
  if (sourceAspect > targetAspect) {
    const sw = imageHeight * targetAspect
    return { sx: (imageWidth - sw) / 2, sy: 0, sw, sh: imageHeight }
  }
  const sh = imageWidth / targetAspect
  return { sx: 0, sy: (imageHeight - sh) / 2, sw: imageWidth, sh }
}

/**
 * Crops the image to the cols x rows aspect ratio (cells treated as square
 * for now — real per-cell aspect ratio from font metrics is applied in a
 * later milestone) and samples it into cols x rows cell features, in
 * row-major order.
 */
export function sampleImageBlocks(
  image: CanvasImageSource & { width: number; height: number },
  cols: number,
  rows: number,
): CellFeature[] {
  const crop = computeCenterCrop(image.width, image.height, cols / rows)

  const canvas = document.createElement('canvas')
  canvas.width = cols * SHAPE_GRID_SIZE
  canvas.height = rows * SHAPE_GRID_SIZE
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Canvas 2D nie jest dostępny.')
  ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, canvas.width, canvas.height)

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const cells: CellFeature[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let rSum = 0
      let gSum = 0
      let bSum = 0
      const shapeGrid = new Float32Array(SHAPE_GRID_SIZE * SHAPE_GRID_SIZE)

      for (let y = 0; y < SHAPE_GRID_SIZE; y++) {
        for (let x = 0; x < SHAPE_GRID_SIZE; x++) {
          const px = col * SHAPE_GRID_SIZE + x
          const py = row * SHAPE_GRID_SIZE + y
          const idx = (py * canvas.width + px) * 4
          const r = data[idx]
          const g = data[idx + 1]
          const b = data[idx + 2]
          rSum += r
          gSum += g
          bSum += b
          shapeGrid[y * SHAPE_GRID_SIZE + x] = luminance01(r, g, b)
        }
      }

      const n = SHAPE_GRID_SIZE * SHAPE_GRID_SIZE
      cells.push({ avgColorLab: rgbToLab(rSum / n, gSum / n, bSum / n), shapeGrid })
    }
  }

  return cells
}
