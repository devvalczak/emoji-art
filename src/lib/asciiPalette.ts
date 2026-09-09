import { measureInkCoverage } from './asciiFeatureExtraction'
import type { AsciiSettings } from './types'

export const CLASSIC_RAMP = ' .:-=+*#%@'
export const EXTENDED_RAMP =
  ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
export const BLOCKS_RAMP = ' ░▒▓█'

export const ASCII_PALETTE_VERSION = 1

export function resolveCharset(
  settings: Pick<AsciiSettings, 'charsetPreset' | 'customCharset'>,
): string {
  switch (settings.charsetPreset) {
    case 'classic10':
      return CLASSIC_RAMP
    case 'extended70':
      return EXTENDED_RAMP
    case 'blocks':
      return BLOCKS_RAMP
    case 'custom':
      return settings.customCharset.length > 0 ? settings.customCharset : CLASSIC_RAMP
  }
}

/** Unique candidate characters for a charset. Order doesn't matter here — used as a bestfit matching palette. */
export function getCharsetChars(
  settings: Pick<AsciiSettings, 'charsetPreset' | 'customCharset'>,
): string[] {
  return Array.from(new Set(Array.from(resolveCharset(settings))))
}

const rampCache = new Map<string, string[]>()

function rampCacheKey(
  settings: Pick<AsciiSettings, 'charsetPreset' | 'customCharset' | 'fontWeight'>,
): string {
  return `${settings.charsetPreset}:${settings.customCharset}:${settings.fontWeight}`
}

/**
 * Candidate characters ordered from least to most "ink" (rendered alpha
 * coverage) for the given font weight, used for density-ramp lookup.
 * Re-measures even preset ramps rather than trusting their authored order,
 * since actual glyph coverage depends on the monospace font actually
 * available in the browser.
 */
export function buildOrderedRamp(
  settings: Pick<AsciiSettings, 'charsetPreset' | 'customCharset' | 'fontWeight'>,
): string[] {
  const key = rampCacheKey(settings)
  const cached = rampCache.get(key)
  if (cached) return cached

  const ramp = getCharsetChars(settings)
    .map((char) => ({ char, coverage: measureInkCoverage(char, settings.fontWeight) }))
    .sort((a, b) => a.coverage - b.coverage)
    .map((entry) => entry.char)

  rampCache.set(key, ramp)
  return ramp
}
