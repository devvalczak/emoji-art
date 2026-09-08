import type { ConvertWorkerResponse } from '../workers/convertWorkerTypes'
import type { RenderWorkerResponse } from '../workers/renderWorkerTypes'
import type { GridResult, Settings, StyleId } from './types'

let worker: Worker | null = null

function getWorker(): Worker {
  worker ??= new Worker(new URL('../workers/convert.worker.ts', import.meta.url), {
    type: 'module',
  })
  return worker
}

let renderWorker: Worker | null = null

function getRenderWorker(): Worker {
  renderWorker ??= new Worker(new URL('../workers/render.worker.ts', import.meta.url), {
    type: 'module',
  })
  return renderWorker
}

export function runConvertWorker(
  imageBitmap: ImageBitmap,
  settings: Settings,
  onProgress: (done: number, total: number) => void,
): Promise<GridResult> {
  return new Promise((resolve, reject) => {
    const w = getWorker()

    function cleanup() {
      w.removeEventListener('message', handleMessage)
      w.removeEventListener('error', handleError)
    }
    function handleMessage(e: MessageEvent<ConvertWorkerResponse>) {
      const msg = e.data
      if (msg.type === 'progress') {
        onProgress(msg.done, msg.total)
        return
      }
      cleanup()
      if (msg.type === 'result') resolve(msg.result)
      else reject(new Error(msg.message))
    }
    function handleError(e: ErrorEvent) {
      cleanup()
      reject(new Error(e.message))
    }

    w.addEventListener('message', handleMessage)
    w.addEventListener('error', handleError)
    w.postMessage({ type: 'convert', imageBitmap, settings }, [imageBitmap])
  })
}

export function runRenderWorker(
  grid: GridResult,
  styleId: StyleId,
  cellPx: number,
  onProgress: (done: number, total: number) => void,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const w = getRenderWorker()

    function cleanup() {
      w.removeEventListener('message', handleMessage)
      w.removeEventListener('error', handleError)
    }
    function handleMessage(e: MessageEvent<RenderWorkerResponse>) {
      const msg = e.data
      if (msg.type === 'progress') {
        onProgress(msg.done, msg.total)
        return
      }
      cleanup()
      if (msg.type === 'result') resolve(msg.blob)
      else reject(new Error(msg.message))
    }
    function handleError(e: ErrorEvent) {
      cleanup()
      reject(new Error(e.message))
    }

    w.addEventListener('message', handleMessage)
    w.addEventListener('error', handleError)
    w.postMessage({ type: 'render', grid, styleId, cellPx })
  })
}
