/** Unicode scalar code points of an emoji grapheme, as lowercase hex strings, e.g. "❤️" -> ["2764", "fe0f"]. */
export function emojiToHexCodepoints(emoji: string): string[] {
  return Array.from(emoji).map((ch) => (ch.codePointAt(0) ?? 0).toString(16))
}

/**
 * Candidate filename stems (without extension) for looking up an emoji's
 * asset on a CDN, most-likely-first. Different emoji asset projects disagree
 * on whether the variation-selector-16 codepoint (FE0F) is kept in the
 * filename, so we try both forms rather than hardcoding one.
 */
export function emojiFilenameCandidates(emoji: string, uppercase: boolean): string[] {
  const codepoints = emojiToHexCodepoints(emoji)
  const withVs = codepoints.join('-')
  const withoutVs = codepoints.filter((cp) => cp !== 'fe0f').join('-')
  const candidates = withVs === withoutVs ? [withVs] : [withVs, withoutVs]
  return uppercase ? candidates.map((c) => c.toUpperCase()) : candidates
}
