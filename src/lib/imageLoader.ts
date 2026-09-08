export class CorsImageError extends Error {
  constructor(sourceUrl: string) {
    super(
      `Nie udało się wczytać obrazu z podanego adresu URL, ponieważ serwer nie zezwala na odczyt danych obrazu z innej domeny (CORS). ` +
        `Spróbuj pobrać obraz na dysk i wgrać go jako plik zamiast wklejać URL. (${sourceUrl})`,
    )
    this.name = 'CorsImageError'
  }
}

function loadImageElement(src: string, crossOrigin: 'anonymous' | null): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (crossOrigin) img.crossOrigin = crossOrigin
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Nie udało się wczytać obrazu.'))
    img.src = src
  })
}

/** Draws a 1x1 sample to detect whether the image taints the canvas (CORS-blocked). */
function assertReadable(img: HTMLImageElement, sourceUrl: string): void {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D nie jest dostępny w tej przeglądarce.')
  ctx.drawImage(img, 0, 0, 1, 1)
  try {
    ctx.getImageData(0, 0, 1, 1)
  } catch {
    throw new CorsImageError(sourceUrl)
  }
}

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await loadImageElement(objectUrl, null)
    assertReadable(img, file.name)
    return img
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export async function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  const img = await loadImageElement(url, 'anonymous')
  assertReadable(img, url)
  return img
}
