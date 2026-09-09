import { extractAsciiCharFeatures } from './asciiFeatureExtraction'
import { ASCII_PALETTE_VERSION, getCharsetChars } from './asciiPalette'
import { idbGet, idbSet } from './idbCache'
import type { AsciiSettings, EmojiFeatureVector } from './types'

// In-memory cache for the current session/worker instance, backed by an
// IndexedDB-persisted cache, mirroring featureCache.ts's pattern for the
// emoji palette.
const memoryCache = new Map<string, Promise<EmojiFeatureVector[]>>()

type AsciiPaletteSettings = Pick<AsciiSettings, 'charsetPreset' | 'customCharset' | 'fontWeight'>

function cacheKey(settings: AsciiPaletteSettings, charCount: number): string {
  const charsetPart = settings.charsetPreset === 'custom' ? settings.customCharset : settings.charsetPreset
  return `ascii:${charsetPart}:${settings.fontWeight}:v${ASCII_PALETTE_VERSION}:${charCount}`
}

async function computeAndPersist(
  settings: AsciiPaletteSettings,
  chars: string[],
): Promise<EmojiFeatureVector[]> {
  const features = chars.map((char) => extractAsciiCharFeatures(char, settings.fontWeight))
  try {
    await idbSet(cacheKey(settings, chars.length), features)
  } catch {
    // Best-effort persistence only (e.g. unavailable in private browsing) —
    // the in-memory cache still makes this session fast.
  }
  return features
}

export function getAsciiPaletteFeatures(
  settings: AsciiPaletteSettings,
): Promise<EmojiFeatureVector[]> {
  const chars = getCharsetChars(settings)
  const key = cacheKey(settings, chars.length)
  let promise = memoryCache.get(key)
  if (!promise) {
    promise = (async () => {
      try {
        const cached = await idbGet<EmojiFeatureVector[]>(key)
        if (cached && cached.length === chars.length) return cached
      } catch {
        // ignore, fall through to recompute
      }
      return computeAndPersist(settings, chars)
    })()
    memoryCache.set(key, promise)
  }
  return promise
}
