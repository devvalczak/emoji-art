import type { GridResult, Settings } from '../lib/types'

export interface ConvertWorkerRequest {
  type: 'convert'
  imageBitmap: ImageBitmap
  settings: Settings
  /** Width/height ratio of one rendered cell, measured on the main thread (see lib/aspectRatio.ts). */
  cellAspect: number
}

export type ConvertWorkerResponse =
  | { type: 'progress'; done: number; total: number }
  | { type: 'result'; result: GridResult }
  | { type: 'error'; message: string }
