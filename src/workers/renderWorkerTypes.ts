import type { GridResult, StyleId } from '../lib/types'

export interface RenderWorkerRequest {
  type: 'render'
  grid: GridResult
  styleId: StyleId
  cellPx: number
}

export type RenderWorkerResponse =
  | { type: 'progress'; done: number; total: number }
  | { type: 'result'; blob: Blob }
  | { type: 'error'; message: string }
