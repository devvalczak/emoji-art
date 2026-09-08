import { AttributionFooter } from './components/AttributionFooter'
import { PreviewCanvas } from './components/PreviewCanvas'
import { ResultTextView } from './components/ResultTextView'
import { SettingsPanel } from './components/SettingsPanel'
import { UploadPanel } from './components/UploadPanel'
import { useAppStore } from './state/useAppStore'
import './App.css'

function App() {
  const sourceError = useAppStore((s) => s.sourceError)

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
        <ResultTextView />
      </main>

      <AttributionFooter />
    </div>
  )
}

export default App
