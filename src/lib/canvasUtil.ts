export type AnyCanvas = HTMLCanvasElement | OffscreenCanvas
export type AnyCanvasContext2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

/**
 * Creates a canvas that works both on the main thread and inside a Web
 * Worker. OffscreenCanvas is preferred (it works in both contexts); falls
 * back to a DOM canvas for older browsers that only support that on the
 * main thread.
 */
export function createCanvas(width: number, height: number): AnyCanvas {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height)
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

export function get2dContext(canvas: AnyCanvas): AnyCanvasContext2D {
  const ctx = canvas.getContext('2d', { willReadFrequently: true }) as AnyCanvasContext2D | null
  if (!ctx) throw new Error('Canvas 2D nie jest dostępny.')
  return ctx
}

export function canvasToBlob(canvas: AnyCanvas): Promise<Blob> {
  if ('convertToBlob' in canvas) {
    return canvas.convertToBlob({ type: 'image/png' })
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Nie udało się wygenerować obrazu PNG.'))
    }, 'image/png')
  })
}
