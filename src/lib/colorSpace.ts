import { converter } from 'culori'

const toLab = converter('lab')
const toRgb = converter('rgb')

/** Converts 0-255 sRGB channels to CIE L*a*b*. Missing channel values (e.g. for achromatic colors) become 0. */
export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const lab = toLab({ mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 })
  return [lab.l ?? 0, lab.a ?? 0, lab.b ?? 0]
}

/** Converts CIE L*a*b* back to a clamped sRGB hex color string, e.g. "#a1b2c3". */
export function labToRgbHex(lab: [number, number, number]): string {
  const rgb = toRgb({ mode: 'lab', l: lab[0], a: lab[1], b: lab[2] })
  const channel = (v: number | undefined) =>
    Math.round(Math.min(1, Math.max(0, v ?? 0)) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${channel(rgb.r)}${channel(rgb.g)}${channel(rgb.b)}`
}

export function labDistance(a: [number, number, number], b: [number, number, number]): number {
  const dl = a[0] - b[0]
  const da = a[1] - b[1]
  const db = a[2] - b[2]
  return Math.sqrt(dl * dl + da * da + db * db)
}

/** Perceptual luminance for 0-255 sRGB channels, normalized to 0..1. */
export function luminance01(r: number, g: number, b: number): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}
