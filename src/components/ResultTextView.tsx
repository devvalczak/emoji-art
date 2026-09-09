import { monospaceFontStack } from '../lib/asciiFont'
import { systemEmojiFontStack } from '../lib/emojiStyles'
import { gridToText } from '../lib/textRenderer'
import { useAppStore } from '../state/useAppStore'

export function ResultTextView() {
  const gridResult = useAppStore((s) => s.gridResult)
  const settings = useAppStore((s) => s.settings)

  if (!gridResult) return null

  const isAscii = settings.renderMode === 'ascii'
  const showColored = isAscii && settings.ascii.colorMode === 'colored'

  return (
    <div className="panel result-panel">
      <h2>3. Wynik (tekst)</h2>
      {!isAscii && settings.styleId !== 'system' && (
        <p className="hint">
          Tryb tekstowy zawsze pokazuje emoji czcionką Twojego urządzenia — wybrany styl wpływa
          na to, które emoji zostały dobrane, a nie na to, jak wyglądają tutaj. Pełną gwarancję
          wybranego stylu daje eksport obrazkowy.
        </p>
      )}
      <div
        className="result-text"
        style={{
          fontSize: `${settings.fontSizePx}px`,
          lineHeight: settings.lineHeight,
          letterSpacing: `${settings.letterSpacingPx}px`,
          fontFamily: isAscii ? monospaceFontStack() : systemEmojiFontStack(),
          backgroundColor: settings.backgroundColor ?? undefined,
          color: isAscii && !showColored ? settings.ascii.monoColor : undefined,
        }}
      >
        {showColored
          ? gridResult.cells.map((cell, i) => (
              <span key={i} style={{ color: cell.color ?? settings.ascii.monoColor }}>
                {cell.glyph}
                {(i + 1) % gridResult.cols === 0 ? '\n' : ''}
              </span>
            ))
          : gridToText(gridResult)}
      </div>
    </div>
  )
}
