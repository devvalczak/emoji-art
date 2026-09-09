import type { AnyCanvasContext2D } from './canvasUtil'
import { getEmojiBitmap, isCdnStyle } from './emojiAssetLoader'
import type { StyleId } from './types'

export interface EmojiStyleInfo {
  id: StyleId
  label: string
  /** Short attribution/license note shown in the UI footer. Undefined for the system style (nothing to attribute). */
  attribution?: string
}

export const EMOJI_STYLES: EmojiStyleInfo[] = [
  {
    id: 'system',
    label: 'Systemowe (Twoje urządzenie)',
  },
  {
    id: 'twemoji',
    label: 'Twemoji',
    attribution: 'Twemoji — © Twitter/jdecked, licencja CC-BY 4.0.',
  },
  {
    id: 'openmoji',
    label: 'OpenMoji',
    attribution:
      'OpenMoji — licencja CC-BY-SA 4.0 (grafiki wyeksportowane w tym stylu podlegają wymogowi share-alike).',
  },
]

const SYSTEM_EMOJI_FONT_STACK =
  "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji','Segoe UI Symbol',sans-serif"

/** CSS font-family value to use when rendering emoji as real text (only meaningful for the 'system' style). */
export function systemEmojiFontStack(): string {
  return SYSTEM_EMOJI_FONT_STACK
}

/**
 * Draws a single emoji into the given 2D context, filling a size x size box
 * centered at (0, 0)..(size, size). For CDN-backed styles this draws the
 * actual style-specific image asset (fetched once and cached), guaranteeing
 * a consistent look regardless of the viewer's OS; for "system" it draws
 * text using the viewer's own emoji font.
 */
export async function drawEmoji(
  ctx: AnyCanvasContext2D,
  emoji: string,
  styleId: StyleId,
  size: number,
): Promise<void> {
  if (isCdnStyle(styleId)) {
    const bitmap = await getEmojiBitmap(emoji, styleId)
    ctx.drawImage(bitmap, 0, 0, size, size)
    return
  }
  ctx.font = `${size * 0.85}px ${SYSTEM_EMOJI_FONT_STACK}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, size / 2, size / 2 + size * 0.05)
}
