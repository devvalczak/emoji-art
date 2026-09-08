import { EMOJI_PALETTE, PALETTE_VERSION } from './emojiPalette'
import { extractEmojiFeatures } from './featureExtraction'
import { idbGet, idbSet } from './idbCache'
import type { EmojiFeatureVector, StyleId } from './types'

// In-memory cache for the current session/worker instance, backed by an
// IndexedDB-persisted cache so the palette doesn't need to be re-rendered
// and re-analyzed on every page load or every worker restart.
const memoryCache = new Map<StyleId, Promise<EmojiFeatureVector[]>>()

function cacheKey(styleId: StyleId): string {
  return `${styleId}:v${PALETTE_VERSION}:${EMOJI_PALETTE.length}`
}

async function computeAndPersist(styleId: StyleId): Promise<EmojiFeatureVector[]> {
  const features = await Promise.all(
    EMOJI_PALETTE.map((emoji) => extractEmojiFeatures(emoji, styleId)),
  )
  try {
    await idbSet(cacheKey(styleId), features)
  } catch {
    // Best-effort persistence only (e.g. unavailable in private browsing) —
    // the in-memory cache still makes this session fast.
  }
  return features
}

export function getPaletteFeatures(styleId: StyleId): Promise<EmojiFeatureVector[]> {
  let promise = memoryCache.get(styleId)
  if (!promise) {
    promise = (async () => {
      try {
        const cached = await idbGet<EmojiFeatureVector[]>(cacheKey(styleId))
        if (cached && cached.length === EMOJI_PALETTE.length) return cached
      } catch {
        // ignore, fall through to recompute
      }
      return computeAndPersist(styleId)
    })()
    memoryCache.set(styleId, promise)
  }
  return promise
}
