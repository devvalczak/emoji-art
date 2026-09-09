import { canvasToBlob, createCanvas, get2dContext } from './canvasUtil'
import { renderGridToContext } from './imageRenderer'
import type { GridResult, StyleId } from './types'
import { runRenderWorker } from './workerClient'

const supportsOffscreenWorker = typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined'

export async function renderGridToPngBlob(
  grid: GridResult,
  styleId: StyleId,
  cellPx: number,
  onProgress: (done: number, total: number) => void,
): Promise<Blob> {
  if (supportsOffscreenWorker) {
    return runRenderWorker(grid, styleId, cellPx, onProgress)
  }
  // Older browsers without OffscreenCanvas-in-worker support: render directly
  // on the main thread. renderGridToContext yields periodically so the tab
  // doesn't fully freeze.
  const canvas = createCanvas(grid.cols * cellPx, grid.rows * cellPx)
  const ctx = get2dContext(canvas)
  await renderGridToContext(ctx, grid, styleId, cellPx, onProgress)
  return canvasToBlob(canvas)
}
