import { sampleImageBlocks } from './blockSampler'
import { getPaletteFeatures } from './featureCache'
import { findBestMatch } from './matcher'
import type { GridResult, Settings } from './types'

export async function convertImageToGrid(
  image: CanvasImageSource & { width: number; height: number },
  settings: Settings,
): Promise<GridResult> {
  const palette = await getPaletteFeatures(settings.styleId)
  const cellFeatures = sampleImageBlocks(image, settings.cols, settings.rows)
  const cells = cellFeatures.map((cell) => ({
    emoji: findBestMatch(cell, palette, settings.matchMode, settings.mixedWeight),
  }))
  return { cols: settings.cols, rows: settings.rows, cells }
}
