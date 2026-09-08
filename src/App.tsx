import { AttributionFooter } from './components/AttributionFooter'
import { ModeToggle } from './components/ModeToggle'
import { PreviewCanvas } from './components/PreviewCanvas'
import { ResultImageView } from './components/ResultImageView'
import { ResultTextView } from './components/ResultTextView'
import { SettingsPanel } from './components/SettingsPanel'
import { UploadPanel } from './components/UploadPanel'
import { useAppStore } from './state/useAppStore'
import './App.css'

function App() {
  const sourceError = useAppStore((s) => s.sourceError)
  const resultMode = useAppStore((s) => s.resultMode)

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Emoji Art</h1>
        <p>Zamień zdjęcie w mozaikę z emoji.</p>
      </header>

      {sourceError && <div className="error-banner">{sourceError}</div>}

      <main className="app-main">
        <UploadPanel />
        <PreviewCanvas />
        <SettingsPanel />
        <ModeToggle />
        {resultMode === 'text' ? <ResultTextView /> : <ResultImageView />}
      </main>

      <AttributionFooter />
    </div>
  )
}

export default App
