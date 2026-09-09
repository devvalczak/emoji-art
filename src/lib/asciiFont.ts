const MONOSPACE_FONT_STACK =
  "'SFMono-Regular','Menlo','Consolas','Liberation Mono','Courier New',monospace"

/** CSS font-family value used everywhere ASCII characters are drawn (canvas and text preview). */
export function monospaceFontStack(): string {
  return MONOSPACE_FONT_STACK
}
