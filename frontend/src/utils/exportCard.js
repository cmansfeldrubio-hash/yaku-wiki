import { toPng } from 'html-to-image'
import { CARD_WIDTH } from './cardLayout'

// Renders the card DOM node to a PNG data URL at (close to) the native
// card-font.png resolution, regardless of how big it's shown on screen.
export async function exportCardPng(node) {
  if (document.fonts?.ready) await document.fonts.ready

  const rect = node.getBoundingClientRect()
  const pixelRatio = rect.width > 0 ? Math.max(1, CARD_WIDTH / rect.width) : 1

  return toPng(node, {
    pixelRatio,
    cacheBust: true,
    fetchRequestInit: { mode: 'cors' },
  })
}

export async function exportCardFile(node, filename = 'carta.png') {
  const dataUrl = await exportCardPng(node)
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return new File([blob], filename, { type: 'image/png' })
}

export function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}
