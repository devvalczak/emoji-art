import { useRef, useState } from 'react'
import { loadImageFromFile, loadImageFromUrl } from '../lib/imageLoader'
import { useAppStore } from '../state/useAppStore'

export function UploadPanel() {
  const [url, setUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const setSourceImage = useAppStore((s) => s.setSourceImage)
  const setSourceError = useAppStore((s) => s.setSourceError)
  const setIsLoadingSource = useAppStore((s) => s.setIsLoadingSource)
  const isLoadingSource = useAppStore((s) => s.isLoadingSource)

  async function handleFile(file: File) {
    setIsLoadingSource(true)
    try {
      const img = await loadImageFromFile(file)
      setSourceImage(img)
    } catch (err) {
      setSourceError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoadingSource(false)
    }
  }

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setIsLoadingSource(true)
    try {
      const img = await loadImageFromUrl(url.trim())
      setSourceImage(img)
    } catch (err) {
      setSourceError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoadingSource(false)
    }
  }

  return (
    <div className="panel upload-panel">
      <h2>1. Wgraj zdjęcie</h2>
      <div
        className={`dropzone${isDragging ? ' dropzone--active' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          const file = e.dataTransfer.files[0]
          if (file) void handleFile(file)
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
          }}
        />
        <p>Przeciągnij i upuść zdjęcie tutaj, albo kliknij, aby wybrać plik.</p>
      </div>

      <form className="url-form" onSubmit={handleUrlSubmit}>
        <input
          type="url"
          placeholder="...albo wklej URL obrazu"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="submit" disabled={isLoadingSource}>
          Wczytaj
        </button>
      </form>
      {isLoadingSource && <p className="hint">Wczytywanie…</p>}
    </div>
  )
}
