import { useEffect, useRef } from 'react'
import { measureCellAspect } from '../lib/aspectRatio'
import { computeCenterCrop } from '../lib/blockSampler'
import { useAppStore } from '../state/useAppStore'

const MAX_PREVIEW_SIZE = 480

export function PreviewCanvas() {
  const sourceImage = useAppStore((s) => s.sourceImage)
  const settings = useAppStore((s) => s.settings)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !sourceImage) return
    const scale = Math.min(
      1,
      MAX_PREVIEW_SIZE / Math.max(sourceImage.naturalWidth, sourceImage.naturalHeight),
    )
    canvas.width = Math.round(sourceImage.naturalWidth * scale)
    canvas.height = Math.round(sourceImage.naturalHeight * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height)

    // Dim the parts of the image that will be cropped away, so the crop
    // (which follows the real on-screen emoji cell aspect ratio, not a
    // square assumption) is visible before generating.
    const cellAspect = measureCellAspect(settings)
    const crop = computeCenterCrop(
      canvas.width,
      canvas.height,
      (settings.cols / settings.rows) * cellAspect,
    )
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    if (crop.sy > 0) {
      ctx.fillRect(0, 0, canvas.width, crop.sy)
      ctx.fillRect(0, crop.sy + crop.sh, canvas.width, canvas.height - crop.sy - crop.sh)
    }
    if (crop.sx > 0) {
      ctx.fillRect(0, 0, crop.sx, canvas.height)
      ctx.fillRect(crop.sx + crop.sw, 0, canvas.width - crop.sx - crop.sw, canvas.height)
    }
  }, [sourceImage, settings])

  if (!sourceImage) return null

  return (
    <div className="panel preview-panel">
      <h2>Podgląd</h2>
      <canvas ref={canvasRef} className="preview-canvas" />
      <p className="hint">Przyciemniony obszar zostanie odcięty przed konwersją.</p>
    </div>
  )
}
