import type { GridResult, Settings } from '../lib/types'

export interface ConvertWorkerRequest {
  type: 'convert'
  imageBitmap: ImageBitmap
  settings: Settings
}

export type ConvertWorkerResponse =
  | { type: 'progress'; done: number; total: number }
  | { type: 'result'; result: GridResult }
  | { type: 'error'; message: string }
