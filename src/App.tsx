import { PreviewCanvas } from './components/PreviewCanvas'
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
      </main>
    </div>
  )
}

export default App
