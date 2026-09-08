import { useAppStore } from '../state/useAppStore'

export function ModeToggle() {
  const gridResult = useAppStore((s) => s.gridResult)
  const resultMode = useAppStore((s) => s.resultMode)
  const setResultMode = useAppStore((s) => s.setResultMode)

  if (!gridResult) return null

  return (
    <div className="mode-toggle">
      <button
        type="button"
        className={resultMode === 'text' ? 'active' : ''}
        onClick={() => setResultMode('text')}
      >
        Tekst
      </button>
      <button
        type="button"
        className={resultMode === 'image' ? 'active' : ''}
        onClick={() => setResultMode('image')}
      >
        Obraz
      </button>
    </div>
  )
}
