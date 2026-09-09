export type MatchMode = 'color' | 'shape' | 'mixed'

export type StyleId = 'system' | 'twemoji' | 'openmoji'

export type RenderMode = 'emoji' | 'ascii'

/** 'bestfit' reuses the color/shape matcher (like emoji) against a palette of characters; 'density' maps per-cell brightness onto a character ramp. */
export type AsciiStrategy = 'bestfit' | 'density'

export type AsciiCharsetPreset = 'classic10' | 'extended70' | 'blocks' | 'custom'

export type AsciiColorMode = 'mono' | 'colored'

export interface AsciiSettings {
  strategy: AsciiStrategy
  charsetPreset: AsciiCharsetPreset
  /** Used when charsetPreset === 'custom'. */
  customCharset: string
  /** -100..100, 0 = no change. */
  contrast: number
  /** -100..100, 0 = no change. */
  brightness: number
  /** 0.1..3, 1 = no change. */
  gamma: number
  invert: boolean
  colorMode: AsciiColorMode
  /** Foreground color used when colorMode === 'mono'. */
  monoColor: string
  fontWeight: 'normal' | 'bold'
  /** Only meaningful for strategy === 'density': overlay directional line characters on detected edges. */
  edgeOverlay: boolean
  /** 0..1, only used when edgeOverlay is on. */
  edgeThreshold: number
  /** Only meaningful for strategy === 'density': Floyd-Steinberg error diffusion before ramp mapping. */
  dither: boolean
}

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
  /** Background color for the exported PNG and text preview. null = transparent/no fill. */
  backgroundColor: string | null
  renderMode: RenderMode
  ascii: AsciiSettings
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
  backgroundColor: null,
  renderMode: 'emoji',
  ascii: {
    strategy: 'density',
    charsetPreset: 'classic10',
    customCharset: '',
    contrast: 0,
    brightness: 0,
    gamma: 1,
    invert: false,
    colorMode: 'mono',
    monoColor: '#333333',
    fontWeight: 'normal',
    edgeOverlay: false,
    edgeThreshold: 0.25,
    dither: false,
  },
}

/** Side length of the per-cell/per-emoji sampling grid used for both color and shape features. */
export const SHAPE_GRID_SIZE = 8

export interface EmojiFeatureVector {
  /** The emoji grapheme or ASCII character itself, e.g. "🙂" or "@". */
  id: string
  avgColorLab: [number, number, number]
  /** Flattened SHAPE_GRID_SIZE x SHAPE_GRID_SIZE alpha-weighted luminance grid, values in 0..1. */
  shapeGrid: Float32Array
}

export interface GridCell {
  glyph: string
  /** Average color of the source cell, as a hex string. Only set when ascii colorMode === 'colored'. */
  color?: string
}

export interface GridResult {
  cols: number
  rows: number
  cells: GridCell[]
}
