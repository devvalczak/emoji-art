/// <reference lib="webworker" />
import { canvasToBlob, createCanvas, get2dContext } from '../lib/canvasUtil'
import { renderGridToContext } from '../lib/imageRenderer'
import type { RenderWorkerRequest, RenderWorkerResponse } from './renderWorkerTypes'

function post(msg: RenderWorkerResponse) {
  self.postMessage(msg)
}

self.onmessage = async (e: MessageEvent<RenderWorkerRequest>) => {
  const { grid, settings, cellPx } = e.data
  try {
    const canvas = createCanvas(grid.cols * cellPx, grid.rows * cellPx)
    const ctx = get2dContext(canvas)
    await renderGridToContext(ctx, grid, settings, cellPx, (done, total) =>
      post({ type: 'progress', done, total }),
    )
    const blob = await canvasToBlob(canvas)
    post({ type: 'result', blob })
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) })
  }
}
