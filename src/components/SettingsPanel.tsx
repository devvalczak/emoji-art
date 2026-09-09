import { useEffect } from 'react'
import { measureCellAspect } from '../lib/aspectRatio'
import { isCdnStyle, validateCdnStyle } from '../lib/emojiAssetLoader'
import { EMOJI_STYLES } from '../lib/emojiStyles'
import type { AsciiCharsetPreset, AsciiSettings, AsciiStrategy, MatchMode, RenderMode, StyleId } from '../lib/types'
import { runConvertWorker } from '../lib/workerClient'
import { ProgressBar } from './ProgressBar'
import { useAppStore } from '../state/useAppStore'

const ASCII_STRATEGIES: [AsciiStrategy, string][] = [
  ['density', 'Gęstość (rampa jasności)'],
  ['bestfit', 'Best-fit (dopasowanie kształtu/koloru)'],
]

const ASCII_CHARSET_PRESETS: [AsciiCharsetPreset, string][] = [
  ['classic10', 'Klasyczny (10 znaków)'],
  ['extended70', 'Rozszerzony (~70 znaków)'],
  ['blocks', 'Bloki (░▒▓█)'],
  ['custom', 'Własny'],
]

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
  const styleWarning = useAppStore((s) => s.styleWarning)
  const setStyleWarning = useAppStore((s) => s.setStyleWarning)

  const isAscii = settings.renderMode === 'ascii'
  const showMatchMode = !isAscii

  function updateAscii(partial: Partial<AsciiSettings>) {
    updateSettings({ ascii: { ...settings.ascii, ...partial } })
  }

  useEffect(() => {
    if (isAscii || !isCdnStyle(settings.styleId)) {
      setStyleWarning(null)
      return
    }
    let cancelled = false
    setStyleWarning(null)
    validateCdnStyle(settings.styleId).catch((err) => {
      if (cancelled) return
      const label = EMOJI_STYLES.find((s) => s.id === settings.styleId)?.label ?? settings.styleId
      setStyleWarning(
        `Nie udało się połączyć z serwerem grafik dla stylu "${label}" (${err instanceof Error ? err.message : String(err)}). Spróbuj ponownie później albo wybierz styl "Systemowe".`,
      )
    })
    return () => {
      cancelled = true
    }
  }, [isAscii, settings.styleId, setStyleWarning])

  if (!sourceImage) return null

  async function handleGenerate() {
    if (!sourceImage) return
    setIsGenerating(true)
    setGenerationError(null)
    setGenerationProgress(null)
    try {
      const cellAspect = measureCellAspect(settings)
      const imageBitmap = await createImageBitmap(sourceImage)
      const result = await runConvertWorker(imageBitmap, settings, cellAspect, (done, total) =>
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
        <legend>Tryb renderowania</legend>
        {(
          [
            ['emoji', 'Emoji'],
            ['ascii', 'ASCII art'],
          ] as [RenderMode, string][]
        ).map(([mode, label]) => (
          <label key={mode} className="match-mode__option">
            <input
              type="radio"
              name="renderMode"
              checked={settings.renderMode === mode}
              onChange={() => updateSettings({ renderMode: mode })}
            />
            {label}
          </label>
        ))}
      </fieldset>

      {isAscii && (
        <fieldset className="match-mode">
          <legend>Strategia generowania ASCII</legend>
          {ASCII_STRATEGIES.map(([strategy, label]) => (
            <label key={strategy} className="match-mode__option">
              <input
                type="radio"
                name="asciiStrategy"
                checked={settings.ascii.strategy === strategy}
                onChange={() => updateAscii({ strategy })}
              />
              {label}
            </label>
          ))}
          {settings.ascii.strategy === 'bestfit' && (
            <p className="hint">
              Dopasowuje kształt znaku do kształtu komórki obrazu (kolor znaków ustawiasz osobno
              niżej).
            </p>
          )}
        </fieldset>
      )}

      {showMatchMode && (
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
      )}

      {isAscii && settings.ascii.strategy === 'density' && (
        <fieldset className="match-mode">
          <legend>Ustawienia gęstości</legend>
          <label className="match-mode__option">
            <input
              type="checkbox"
              checked={settings.ascii.edgeOverlay}
              onChange={(e) => updateAscii({ edgeOverlay: e.target.checked })}
            />
            Ostre krawędzie
          </label>
          {settings.ascii.edgeOverlay && (
            <label className="match-mode__weight">
              Próg czułości krawędzi ({settings.ascii.edgeThreshold.toFixed(2)})
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={settings.ascii.edgeThreshold}
                onChange={(e) => updateAscii({ edgeThreshold: Number(e.target.value) })}
              />
            </label>
          )}
          <label className="match-mode__option">
            <input
              type="checkbox"
              checked={settings.ascii.dither}
              onChange={(e) => updateAscii({ dither: e.target.checked })}
            />
            Dithering (Floyd-Steinberg)
          </label>
        </fieldset>
      )}

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
        {!isAscii && (
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
        )}
        {isAscii && (
          <>
            <label>
              Zestaw znaków
              <select
                value={settings.ascii.charsetPreset}
                onChange={(e) =>
                  updateAscii({ charsetPreset: e.target.value as AsciiCharsetPreset })
                }
              >
                {ASCII_CHARSET_PRESETS.map(([preset, label]) => (
                  <option key={preset} value={preset}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {settings.ascii.charsetPreset === 'custom' && (
              <label>
                Własne znaki
                <input
                  type="text"
                  value={settings.ascii.customCharset}
                  onChange={(e) => updateAscii({ customCharset: e.target.value })}
                  placeholder="np. .,-~+=*#@"
                />
              </label>
            )}
            <label>
              Waga czcionki
              <select
                value={settings.ascii.fontWeight}
                onChange={(e) =>
                  updateAscii({ fontWeight: e.target.value as AsciiSettings['fontWeight'] })
                }
              >
                <option value="normal">Normalna</option>
                <option value="bold">Pogrubiona</option>
              </select>
            </label>
            <label>
              Kontrast ({settings.ascii.contrast})
              <input
                type="range"
                min={-100}
                max={100}
                step={5}
                value={settings.ascii.contrast}
                onChange={(e) => updateAscii({ contrast: Number(e.target.value) })}
              />
            </label>
            <label>
              Jasność ({settings.ascii.brightness})
              <input
                type="range"
                min={-100}
                max={100}
                step={5}
                value={settings.ascii.brightness}
                onChange={(e) => updateAscii({ brightness: Number(e.target.value) })}
              />
            </label>
            <label>
              Gamma ({settings.ascii.gamma.toFixed(2)})
              <input
                type="range"
                min={0.1}
                max={3}
                step={0.1}
                value={settings.ascii.gamma}
                onChange={(e) => updateAscii({ gamma: Number(e.target.value) })}
              />
            </label>
            <label>
              <div className="background-color-field">
                <input
                  type="checkbox"
                  checked={settings.ascii.invert}
                  onChange={(e) => updateAscii({ invert: e.target.checked })}
                />
                Inwersja
              </div>
            </label>
            <label>
              Tryb koloru
              <select
                value={settings.ascii.colorMode}
                onChange={(e) =>
                  updateAscii({ colorMode: e.target.value as AsciiSettings['colorMode'] })
                }
              >
                <option value="mono">Jednolity kolor</option>
                <option value="colored">Kolorowe ASCII</option>
              </select>
            </label>
            {settings.ascii.colorMode === 'mono' && (
              <label>
                Kolor znaków
                <input
                  type="color"
                  value={settings.ascii.monoColor}
                  onChange={(e) => updateAscii({ monoColor: e.target.value })}
                />
              </label>
            )}
          </>
        )}
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
          Odstęp między znakami (px)
          <input
            type="number"
            min={-20}
            max={40}
            value={settings.letterSpacingPx}
            onChange={(e) => updateSettings({ letterSpacingPx: Number(e.target.value) })}
          />
        </label>
        <label>
          Tło
          <div className="background-color-field">
            <input
              type="color"
              value={settings.backgroundColor ?? '#ffffff'}
              disabled={settings.backgroundColor === null}
              onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
            />
            <label className="background-color-field__transparent">
              <input
                type="checkbox"
                checked={settings.backgroundColor === null}
                onChange={(e) =>
                  updateSettings({ backgroundColor: e.target.checked ? null : '#ffffff' })
                }
              />
              Przezroczyste
            </label>
          </div>
        </label>
      </div>

      {styleWarning && <p className="hint hint--warning">{styleWarning}</p>}

      {settings.cols * settings.rows > 10000 && (
        <p className="hint hint--warning">
          Duża rozdzielczość ({settings.cols}×{settings.rows} ={' '}
          {settings.cols * settings.rows} komórek) może zająć chwilę do wygenerowania.
        </p>
      )}

      <button type="button" onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? 'Generowanie…' : isAscii ? 'Generuj ASCII art' : 'Generuj emoji art'}
      </button>

      <ProgressBar />

      {generationError && <p className="hint hint--error">{generationError}</p>}
    </div>
  )
}
