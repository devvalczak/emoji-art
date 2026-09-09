import type { GridResult, Settings } from '../lib/types'

export interface RenderWorkerRequest {
  type: 'render'
  grid: GridResult
  settings: Settings
  cellPx: number
}

export type RenderWorkerResponse =
  | { type: 'progress'; done: number; total: number }
  | { type: 'result'; blob: Blob }
  | { type: 'error'; message: string }
