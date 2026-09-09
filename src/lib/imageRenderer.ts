import type { AnyCanvasContext2D } from './canvasUtil'
import { drawEmoji } from './emojiStyles'
import type { GridResult, StyleId } from './types'

const YIELD_EVERY = 200

export async function renderGridToContext(
  ctx: AnyCanvasContext2D,
  grid: GridResult,
  styleId: StyleId,
  cellPx: number,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const total = grid.cells.length
  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / grid.cols)
    const col = i % grid.cols
    ctx.save()
    ctx.translate(col * cellPx, row * cellPx)
    await drawEmoji(ctx, grid.cells[i].emoji, styleId, cellPx)
    ctx.restore()

    if (i % YIELD_EVERY === 0) {
      onProgress?.(i, total)
      // Give the event loop (and, on the main thread, rendering/input) a chance to run.
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  }
  onProgress?.(total, total)
}
