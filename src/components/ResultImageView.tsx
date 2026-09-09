import { useEffect, useState } from 'react'
import { downloadBlob } from '../lib/exportUtils'
import { renderGridToPngBlob } from '../lib/imageExport'
import { useAppStore } from '../state/useAppStore'

const LARGE_OUTPUT_PIXELS = 8000

export function ResultImageView() {
  const gridResult = useAppStore((s) => s.gridResult)
  const settings = useAppStore((s) => s.settings)
  const exportCellPx = useAppStore((s) => s.exportCellPx)
  const setExportCellPx = useAppStore((s) => s.setExportCellPx)
  const imageBlob = useAppStore((s) => s.imageBlob)
  const setImageBlob = useAppStore((s) => s.setImageBlob)
  const isRenderingImage = useAppStore((s) => s.isRenderingImage)
  const setIsRenderingImage = useAppStore((s) => s.setIsRenderingImage)
  const renderProgress = useAppStore((s) => s.renderProgress)
  const setRenderProgress = useAppStore((s) => s.setRenderProgress)
  const renderError = useAppStore((s) => s.renderError)
  const setRenderError = useAppStore((s) => s.setRenderError)

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!imageBlob) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(imageBlob)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [imageBlob])

  if (!gridResult) return null

  const outputWidth = gridResult.cols * exportCellPx
  const outputHeight = gridResult.rows * exportCellPx

  async function handleRender() {
    if (!gridResult) return
    setIsRenderingImage(true)
    setRenderError(null)
    setRenderProgress(null)
    try {
      const blob = await renderGridToPngBlob(gridResult, settings.styleId, exportCellPx, (done, total) =>
        setRenderProgress({ done, total }),
      )
      setImageBlob(blob)
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsRenderingImage(false)
      setRenderProgress(null)
    }
  }

  return (
    <div className="panel result-panel">
      <h2>Wynik (obraz)</h2>

      <div className="settings-grid">
        <label>
          Rozmiar komórki w eksporcie (px)
          <input
            type="number"
            min={4}
            max={200}
            value={exportCellPx}
            onChange={(e) => setExportCellPx(Number(e.target.value))}
          />
        </label>
      </div>

      <p className="hint">
        Wymiary obrazu: {outputWidth}×{outputHeight}px
      </p>
      {Math.max(outputWidth, outputHeight) > LARGE_OUTPUT_PIXELS && (
        <p className="hint hint--warning">
          To duży obraz — renderowanie i eksport mogą zająć chwilę i zużyć sporo pamięci.
        </p>
      )}

      <button type="button" onClick={handleRender} disabled={isRenderingImage}>
        {isRenderingImage ? 'Renderowanie…' : 'Renderuj obraz'}
      </button>

      {isRenderingImage && renderProgress && (
        <div className="progress-bar">
          <div
            className="progress-bar__fill"
            style={{ width: `${Math.round((renderProgress.done / renderProgress.total) * 100)}%` }}
          />
        </div>
      )}

      {renderError && <p className="hint hint--error">{renderError}</p>}

      {previewUrl && (
        <>
          <img src={previewUrl} alt="Wygenerowana mozaika z emoji" className="result-image-preview" />
          <button
            type="button"
            onClick={() => imageBlob && downloadBlob(imageBlob, 'emoji-art.png')}
          >
            Pobierz PNG
          </button>
        </>
      )}
    </div>
  )
}
