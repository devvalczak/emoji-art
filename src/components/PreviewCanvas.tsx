import { useEffect, useRef } from 'react'
import { useAppStore } from '../state/useAppStore'

const MAX_PREVIEW_SIZE = 480

export function PreviewCanvas() {
  const sourceImage = useAppStore((s) => s.sourceImage)
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
    ctx?.drawImage(sourceImage, 0, 0, canvas.width, canvas.height)
  }, [sourceImage])

  if (!sourceImage) return null

  return (
    <div className="panel preview-panel">
      <h2>Podgląd</h2>
      <canvas ref={canvasRef} className="preview-canvas" />
    </div>
  )
}
