import { useAppStore } from '../state/useAppStore'

export function ProgressBar() {
  const isGenerating = useAppStore((s) => s.isGenerating)
  const progress = useAppStore((s) => s.generationProgress)

  if (!isGenerating) return null

  const percent = progress && progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
    </div>
  )
}
