import { drawAsciiChar } from './asciiRenderer'
import type { AnyCanvasContext2D } from './canvasUtil'
import { drawEmoji } from './emojiStyles'
import type { GridResult, Settings } from './types'

const YIELD_EVERY = 200

export async function renderGridToContext(
  ctx: AnyCanvasContext2D,
  grid: GridResult,
  settings: Settings,
  cellPx: number,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const total = grid.cells.length
  if (settings.backgroundColor) {
    ctx.fillStyle = settings.backgroundColor
    ctx.fillRect(0, 0, grid.cols * cellPx, grid.rows * cellPx)
  }
  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / grid.cols)
    const col = i % grid.cols
    const cell = grid.cells[i]
    ctx.save()
    ctx.translate(col * cellPx, row * cellPx)
    if (settings.renderMode === 'ascii') {
      const color =
        settings.ascii.colorMode === 'colored' && cell.color ? cell.color : settings.ascii.monoColor
      drawAsciiChar(ctx, cell.glyph, cellPx, settings.ascii.fontWeight, color)
    } else {
      await drawEmoji(ctx, cell.glyph, settings.styleId, cellPx)
    }
    ctx.restore()

    if (i % YIELD_EVERY === 0) {
      onProgress?.(i, total)
      // Give the event loop (and, on the main thread, rendering/input) a chance to run.
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  }
  onProgress?.(total, total)
}
