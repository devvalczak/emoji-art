import type { AnyCanvasContext2D } from './canvasUtil'
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
]

const SYSTEM_EMOJI_FONT_STACK =
  "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji','Segoe UI Symbol',sans-serif"

/** CSS font-family value to use when rendering emoji as real text (only meaningful for the 'system' style). */
export function systemEmojiFontStack(): string {
  return SYSTEM_EMOJI_FONT_STACK
}

/**
 * Draws a single emoji into the given 2D context, filling a size x size box
 * centered at (0, 0)..(size, size). Returns a promise so styles that need to
 * fetch an image asset (added in a later milestone) fit the same interface.
 */
export async function drawEmoji(
  ctx: AnyCanvasContext2D,
  emoji: string,
  styleId: StyleId,
  size: number,
): Promise<void> {
  if (styleId !== 'system') {
    throw new Error(`Styl emoji "${styleId}" nie jest jeszcze obsługiwany.`)
  }
  ctx.font = `${size * 0.85}px ${SYSTEM_EMOJI_FONT_STACK}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, size / 2, size / 2 + size * 0.05)
}
