import type { GridResult } from './types'

export function gridToRows(grid: GridResult): string[] {
  const rows: string[] = []
  for (let r = 0; r < grid.rows; r++) {
    let line = ''
    for (let c = 0; c < grid.cols; c++) {
      line += grid.cells[r * grid.cols + c].emoji
    }
    rows.push(line)
  }
  return rows
}

export function gridToText(grid: GridResult): string {
  return gridToRows(grid).join('\n')
}
