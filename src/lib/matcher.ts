import { labDistance } from './colorSpace'
import type { EmojiFeatureVector, MatchMode } from './types'

const MAX_COLOR_DIST = 100 // practical range of CIE76 distance in Lab space
const MAX_SHAPE_DIST = Math.sqrt(64) // 8x8 grid, max per-cell diff of 1

function shapeDistance(a: Float32Array, b: Float32Array): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i]
    sum += d * d
  }
  return Math.sqrt(sum)
}

export interface CellFeature {
  avgColorLab: [number, number, number]
  shapeGrid: Float32Array
}

export function distance(
  cell: CellFeature,
  candidate: EmojiFeatureVector,
  mode: MatchMode,
  mixedWeight: number,
): number {
  if (mode === 'color') return labDistance(cell.avgColorLab, candidate.avgColorLab)
  if (mode === 'shape') return shapeDistance(cell.shapeGrid, candidate.shapeGrid)
  const dColor = labDistance(cell.avgColorLab, candidate.avgColorLab) / MAX_COLOR_DIST
  const dShape = shapeDistance(cell.shapeGrid, candidate.shapeGrid) / MAX_SHAPE_DIST
  return mixedWeight * dColor + (1 - mixedWeight) * dShape
}

export function findBestMatch(
  cell: CellFeature,
  palette: EmojiFeatureVector[],
  mode: MatchMode,
  mixedWeight: number,
): string {
  let bestId = palette[0].id
  let bestDist = Infinity
  for (const candidate of palette) {
    const d = distance(cell, candidate, mode, mixedWeight)
    if (d < bestDist) {
      bestDist = d
      bestId = candidate.id
    }
  }
  return bestId
}
