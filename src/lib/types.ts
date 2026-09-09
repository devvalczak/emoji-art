export type MatchMode = 'color' | 'shape' | 'mixed'

export type StyleId = 'system' | 'twemoji' | 'openmoji'

export interface Settings {
  cols: number
  rows: number
  matchMode: MatchMode
  /** Weight of color vs shape in mixed mode. 1 = pure color, 0 = pure shape. */
  mixedWeight: number
  styleId: StyleId
  fontSizePx: number
  lineHeight: number
  letterSpacingPx: number
}

export const DEFAULT_SETTINGS: Settings = {
  cols: 40,
  rows: 40,
  matchMode: 'color',
  mixedWeight: 0.5,
  styleId: 'system',
  fontSizePx: 16,
  lineHeight: 1.1,
  letterSpacingPx: 0,
}

/** Side length of the per-cell/per-emoji sampling grid used for both color and shape features. */
export const SHAPE_GRID_SIZE = 8

export interface EmojiFeatureVector {
  /** The emoji grapheme itself, e.g. "🙂". */
  id: string
  avgColorLab: [number, number, number]
  /** Flattened SHAPE_GRID_SIZE x SHAPE_GRID_SIZE alpha-weighted luminance grid, values in 0..1. */
  shapeGrid: Float32Array
}

export interface GridCell {
  emoji: string
}

export interface GridResult {
  cols: number
  rows: number
  cells: GridCell[]
}
