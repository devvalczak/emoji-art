/// <reference lib="webworker" />
import { sampleImageBlocks } from '../lib/blockSampler'
import { getPaletteFeatures } from '../lib/featureCache'
import { findBestMatch } from '../lib/matcher'
import type { ConvertWorkerRequest, ConvertWorkerResponse } from './convertWorkerTypes'

function post(msg: ConvertWorkerResponse) {
  self.postMessage(msg)
}

self.onmessage = async (e: MessageEvent<ConvertWorkerRequest>) => {
  const { imageBitmap, settings, cellAspect } = e.data
  try {
    const palette = await getPaletteFeatures(settings.styleId)
    const cellFeatures = sampleImageBlocks(imageBitmap, settings.cols, settings.rows, cellAspect)
    imageBitmap.close()

    const total = cellFeatures.length
    const progressStep = Math.max(1, Math.floor(total / 100))
    const cells = new Array(total)

    for (let i = 0; i < total; i++) {
      cells[i] = {
        emoji: findBestMatch(cellFeatures[i], palette, settings.matchMode, settings.mixedWeight),
      }
      if (i % progressStep === 0) post({ type: 'progress', done: i, total })
    }

    post({ type: 'result', result: { cols: settings.cols, rows: settings.rows, cells } })
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) })
  }
}
