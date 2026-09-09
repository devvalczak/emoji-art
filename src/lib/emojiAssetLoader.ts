import { emojiFilenameCandidates } from './codepoints'
import type { StyleId } from './types'

interface CdnStyleConfig {
  uppercase: boolean
  buildUrl: (filenameStem: string) => string
}

// NOTE: URL patterns are based on the documented conventions of these
// projects (jdecked/twemoji, hfg-gmuend/openmoji), pinned to "latest" rather
// than an exact release tag. This network egress to cdn.jsdelivr.net could
// not be live-verified from the development sandbox (blocked at the network
// level there) — verify once with a couple of codepoints in a real browser
// before relying on this in production, and consider pinning an exact
// version once confirmed, for cache stability.
const CDN_STYLES: Partial<Record<StyleId, CdnStyleConfig>> = {
  twemoji: {
    uppercase: false,
    buildUrl: (stem) => `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${stem}.svg`,
  },
  openmoji: {
    uppercase: true,
    buildUrl: (stem) =>
      `https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@latest/color/svg/${stem}.svg`,
  },
}

export function isCdnStyle(styleId: StyleId): boolean {
  return styleId in CDN_STYLES
}

const bitmapCache = new Map<string, Promise<ImageBitmap>>()

async function fetchFirstAvailable(urls: string[]): Promise<Blob> {
  let lastError: unknown
  for (const url of urls) {
    try {
      const res = await fetch(url, { mode: 'cors' })
      if (res.ok) return await res.blob()
      lastError = new Error(`HTTP ${res.status} dla ${url}`)
    } catch (err) {
      lastError = err
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error('Nie udało się pobrać grafiki emoji z CDN.')
}

export function getEmojiBitmap(emoji: string, styleId: StyleId): Promise<ImageBitmap> {
  const config = CDN_STYLES[styleId]
  if (!config) throw new Error(`Styl "${styleId}" nie korzysta z zasobów CDN.`)

  const cacheKey = `${styleId}:${emoji}`
  let promise = bitmapCache.get(cacheKey)
  if (!promise) {
    const urls = emojiFilenameCandidates(emoji, config.uppercase).map(config.buildUrl)
    promise = fetchFirstAvailable(urls).then((blob) => createImageBitmap(blob))
    bitmapCache.set(cacheKey, promise)
  }
  return promise
}

/** Lightweight probe used to surface a broken/unreachable CDN style immediately when selected, rather than after a long matching run. */
export async function validateCdnStyle(styleId: StyleId): Promise<void> {
  await getEmojiBitmap('😀', styleId)
}
