import { EMOJI_STYLES } from '../lib/emojiStyles'
import { useAppStore } from '../state/useAppStore'

export function AttributionFooter() {
  const renderMode = useAppStore((s) => s.settings.renderMode)
  const styleId = useAppStore((s) => s.settings.styleId)

  if (renderMode === 'ascii') return null

  const style = EMOJI_STYLES.find((s) => s.id === styleId)
  if (!style?.attribution) return null

  return <footer className="attribution-footer">{style.attribution}</footer>
}
