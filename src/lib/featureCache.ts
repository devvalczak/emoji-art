import { EMOJI_PALETTE } from './emojiPalette'
import { extractEmojiFeatures } from './featureExtraction'
import type { EmojiFeatureVector, StyleId } from './types'

// In-memory cache for the current session, keyed by style. Persisted
// (IndexedDB) caching across sessions is added once the palette grows large
// enough (and more styles exist) for re-extraction cost to matter.
const cache = new Map<StyleId, Promise<EmojiFeatureVector[]>>()

export function getPaletteFeatures(styleId: StyleId): Promise<EmojiFeatureVector[]> {
  let promise = cache.get(styleId)
  if (!promise) {
    promise = Promise.all(EMOJI_PALETTE.map((emoji) => extractEmojiFeatures(emoji, styleId)))
    cache.set(styleId, promise)
  }
  return promise
}
