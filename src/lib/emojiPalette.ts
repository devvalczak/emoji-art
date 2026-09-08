/**
 * Curated candidate emoji for matching. Kept to simple, single-codepoint
 * emoji (no ZWJ sequences or skin-tone modifiers) to minimize the chance of
 * inconsistent glyph splitting/"tofu" rendering across platforms in text
 * mode, and to keep CDN asset lookups (Twemoji/OpenMoji) simple.
 *
 * Chosen for broad coverage of color, luminance, and shape.
 */
export const EMOJI_PALETTE: string[] = [
  // Faces / round shapes, varied luminance
  '😀', '😃', '😄', '😁', '😆', '😅', '🙂', '🙃', '😉', '😊',
  '😍', '😘', '😜', '🤪', '😎', '🤔', '😐', '😑', '😶', '🙄',
  '😴', '😢', '😭', '😡', '🤬', '😱', '😨', '🥶', '🥵', '🤢',
  '👻', '💀', '🤡', '👽', '🤖',

  // Hearts / simple colored shapes
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💗',

  // Geometric shapes
  '⚫', '⚪', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤',
  '⬛', '⬜', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫',
  '🔺', '🔻', '🔶', '🔷', '🔸', '🔹', '💠', '⭐', '🌟', '✨',

  // Nature
  '🌞', '🌝', '🌛', '🌚', '🌕', '🌑', '☀️', '⛅', '☁️', '⛈️',
  '🌈', '🔥', '💧', '🌊', '🌳', '🌲', '🌴', '🌵', '🍀', '🌸',
  '🌻', '🌹', '🍁', '🍂', '🌍',

  // Food (broad color range)
  '🍎', '🍊', '🍋', '🍌', '🍇', '🍉', '🍓', '🫐', '🥝', '🍆',
  '🥕', '🌽', '🍞', '🧀', '🍫', '🍩', '🍪', '🍯',

  // Animals (varied shape/luminance)
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐴', '🐝',
  '🐛', '🦋', '🐌', '🐙', '🦀', '🐳', '🐬', '🦈',

  // Objects / symbols
  '⚽', '🏀', '🎾', '🎱', '🎯', '🎈', '🎁', '💎', '🔑', '💡',
  '📕', '📗', '📘', '📙', '⌚', '📷', '🎨', '🧩', '🪀',
]
