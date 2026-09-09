/// <reference lib="webworker" />
import { generateDensityGrid } from '../lib/asciiDensityEngine'
import { getAsciiPaletteFeatures } from '../lib/asciiFeatureCache'
import { buildOrderedRamp } from '../lib/asciiPalette'
import { sampleImageBlocks } from '../lib/blockSampler'
import { labToRgbHex } from '../lib/colorSpace'
import { getPaletteFeatures } from '../lib/featureCache'
import { findBestMatch, type CellFeature } from '../lib/matcher'
import type { GridCell } from '../lib/types'
import type { ConvertWorkerRequest, ConvertWorkerResponse } from './convertWorkerTypes'

function post(msg: ConvertWorkerResponse) {
  self.postMessage(msg)
}

self.onmessage = async (e: MessageEvent<ConvertWorkerRequest>) => {
  const { imageBitmap, settings, cellAspect } = e.data
  try {
    const cellFeatures = sampleImageBlocks(imageBitmap, settings.cols, settings.rows, cellAspect)
    imageBitmap.close()

    const total = cellFeatures.length
    const progressStep = Math.max(1, Math.floor(total / 100))
    const cells = new Array<GridCell>(total)
    const colorFor = (cell: CellFeature) => labToRgbHex(cell.avgColorLab)

    let computeCell: (i: number) => GridCell

    if (settings.renderMode === 'ascii') {
      const includeColor = settings.ascii.colorMode === 'colored'
      if (settings.ascii.strategy === 'bestfit') {
        const palette = await getAsciiPaletteFeatures(settings.ascii)
        // Every glyph is drawn in the same flat ink color (see asciiFeatureExtraction.ts),
        // so avgColorLab is near-identical across candidates — only shape usefully
        // differentiates ASCII characters, unlike emoji where matchMode/mixedWeight matter.
        computeCell = (i) => {
          const glyph = findBestMatch(cellFeatures[i], palette, 'shape', 0)
          return includeColor ? { glyph, color: colorFor(cellFeatures[i]) } : { glyph }
        }
      } else {
        const ramp = buildOrderedRamp(settings.ascii)
        const luminance = Float32Array.from(cellFeatures, (c) => c.avgColorLab[0] / 100)
        const glyphs = generateDensityGrid(luminance, settings.cols, settings.rows, settings.ascii, ramp)
        computeCell = (i) =>
          includeColor ? { glyph: glyphs[i], color: colorFor(cellFeatures[i]) } : { glyph: glyphs[i] }
      }
    } else {
      const palette = await getPaletteFeatures(settings.styleId)
      computeCell = (i) => ({
        glyph: findBestMatch(cellFeatures[i], palette, settings.matchMode, settings.mixedWeight),
      })
    }

    for (let i = 0; i < total; i++) {
      cells[i] = computeCell(i)
      if (i % progressStep === 0) post({ type: 'progress', done: i, total })
    }

    post({ type: 'result', result: { cols: settings.cols, rows: settings.rows, cells } })
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) })
  }
}
