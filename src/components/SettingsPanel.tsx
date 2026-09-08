import { EMOJI_STYLES } from '../lib/emojiStyles'
import type { MatchMode, StyleId } from '../lib/types'
import { runConvertWorker } from '../lib/workerClient'
import { ProgressBar } from './ProgressBar'
import { useAppStore } from '../state/useAppStore'

export function SettingsPanel() {
  const sourceImage = useAppStore((s) => s.sourceImage)
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const isGenerating = useAppStore((s) => s.isGenerating)
  const setIsGenerating = useAppStore((s) => s.setIsGenerating)
  const setGridResult = useAppStore((s) => s.setGridResult)
  const generationError = useAppStore((s) => s.generationError)
  const setGenerationError = useAppStore((s) => s.setGenerationError)
  const setGenerationProgress = useAppStore((s) => s.setGenerationProgress)

  if (!sourceImage) return null

  async function handleGenerate() {
    if (!sourceImage) return
    setIsGenerating(true)
    setGenerationError(null)
    setGenerationProgress(null)
    try {
      const imageBitmap = await createImageBitmap(sourceImage)
      const result = await runConvertWorker(imageBitmap, settings, (done, total) =>
        setGenerationProgress({ done, total }),
      )
      setGridResult(result)
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsGenerating(false)
      setGenerationProgress(null)
    }
  }

  return (
    <div className="panel settings-panel">
      <h2>2. Ustawienia</h2>

      <fieldset className="match-mode">
        <legend>Sposób dopasowania emoji</legend>
        {(
          [
            ['color', 'Po kolorze'],
            ['shape', 'Po kształcie'],
            ['mixed', 'Mieszany'],
          ] as [MatchMode, string][]
        ).map(([mode, label]) => (
          <label key={mode} className="match-mode__option">
            <input
              type="radio"
              name="matchMode"
              checked={settings.matchMode === mode}
              onChange={() => updateSettings({ matchMode: mode })}
            />
            {label}
          </label>
        ))}
        {settings.matchMode === 'mixed' && (
          <label className="match-mode__weight">
            Kolor {Math.round(settings.mixedWeight * 100)}% / Kształt{' '}
            {Math.round((1 - settings.mixedWeight) * 100)}%
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.mixedWeight}
              onChange={(e) => updateSettings({ mixedWeight: Number(e.target.value) })}
            />
          </label>
        )}
      </fieldset>

      <div className="settings-grid">
        <label>
          Kolumny
          <input
            type="number"
            min={2}
            max={300}
            value={settings.cols}
            onChange={(e) => updateSettings({ cols: Number(e.target.value) })}
          />
        </label>
        <label>
          Wiersze
          <input
            type="number"
            min={2}
            max={300}
            value={settings.rows}
            onChange={(e) => updateSettings({ rows: Number(e.target.value) })}
          />
        </label>
        <label>
          Styl emoji
          <select
            value={settings.styleId}
            onChange={(e) => updateSettings({ styleId: e.target.value as StyleId })}
          >
            {EMOJI_STYLES.map((style) => (
              <option key={style.id} value={style.id}>
                {style.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Rozmiar czcionki (px)
          <input
            type="number"
            min={4}
            max={64}
            value={settings.fontSizePx}
            onChange={(e) => updateSettings({ fontSizePx: Number(e.target.value) })}
          />
        </label>
        <label>
          Wysokość linii
          <input
            type="number"
            min={0.5}
            max={3}
            step={0.05}
            value={settings.lineHeight}
            onChange={(e) => updateSettings({ lineHeight: Number(e.target.value) })}
          />
        </label>
        <label>
          Odstęp między emoji (px)
          <input
            type="number"
            min={-20}
            max={40}
            value={settings.letterSpacingPx}
            onChange={(e) => updateSettings({ letterSpacingPx: Number(e.target.value) })}
          />
        </label>
      </div>

      {settings.cols * settings.rows > 10000 && (
        <p className="hint hint--warning">
          Duża rozdzielczość ({settings.cols}×{settings.rows} ={' '}
          {settings.cols * settings.rows} komórek) może zająć chwilę do wygenerowania.
        </p>
      )}

      <button type="button" onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? 'Generowanie…' : 'Generuj emoji art'}
      </button>

      <ProgressBar />

      {generationError && <p className="hint hint--error">{generationError}</p>}
    </div>
  )
}
