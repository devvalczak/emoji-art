import { systemEmojiFontStack } from './emojiStyles'
import type { Settings } from './types'

const SAMPLE_COUNT = 20

/**
 * Measures the real on-screen size of one text-mode emoji cell for the given
 * typography settings, by laying out a run of sample characters in a hidden
 * DOM element and reading the resulting layout box. Must run on the main
 * thread (uses the DOM) — call this before dispatching work to a worker and
 * pass the resulting aspect ratio along, rather than trying to guess font
 * metrics analytically.
 */
export function measureCellSize(
  settings: Pick<Settings, 'fontSizePx' | 'lineHeight' | 'letterSpacingPx'>,
): { width: number; height: number } {
  const el = document.createElement('div')
  el.style.position = 'fixed'
  el.style.top = '-9999px'
  el.style.left = '-9999px'
  el.style.visibility = 'hidden'
  el.style.whiteSpace = 'pre'
  el.style.display = 'inline-block'
  el.style.fontSize = `${settings.fontSizePx}px`
  el.style.lineHeight = String(settings.lineHeight)
  el.style.letterSpacing = `${settings.letterSpacingPx}px`
  el.style.fontFamily = systemEmojiFontStack()
  el.textContent = '😀'.repeat(SAMPLE_COUNT)

  document.body.appendChild(el)
  const rect = el.getBoundingClientRect()
  document.body.removeChild(el)

  const width = rect.width / SAMPLE_COUNT
  const height = rect.height
  if (width <= 0 || height <= 0) return { width: 1, height: 1 }
  return { width, height }
}

/** Width/height ratio of a single rendered cell, for cropping the source image to match. */
export function measureCellAspect(
  settings: Pick<Settings, 'fontSizePx' | 'lineHeight' | 'letterSpacingPx'>,
): number {
  const { width, height } = measureCellSize(settings)
  return width / height
}
