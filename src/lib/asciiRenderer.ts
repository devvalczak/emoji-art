import { monospaceFontStack } from './asciiFont'
import type { AnyCanvasContext2D } from './canvasUtil'

/**
 * Draws a single ASCII character into the given 2D context, filling a
 * size x size box centered at (0, 0)..(size, size). Mirrors emojiStyles.ts's
 * drawEmoji, but always draws plain monospace text with a caller-chosen
 * solid color instead of an emoji font/CDN bitmap.
 */
export function drawAsciiChar(
  ctx: AnyCanvasContext2D,
  char: string,
  size: number,
  fontWeight: 'normal' | 'bold',
  color: string,
): void {
  ctx.font = `${fontWeight} ${size * 0.85}px ${monospaceFontStack()}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.fillText(char, size / 2, size / 2 + size * 0.05)
}
