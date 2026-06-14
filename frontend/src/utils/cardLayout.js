// Layout constants for the Yakutown card maker.
//
// All positions/sizes are expressed as percentages of the card frame
// (card-font.png is 1024x1536px — keep that aspect ratio everywhere).
//
// The "image window" bbox below was measured directly from the pixels of
// card-font.png (the #FF00FF-family magenta rectangle), not estimated.
// The badge anchor/size was NOT present in the frame (that corner is fully
// transparent) and was chosen to fit visually in that empty corner — tweak
// BADGE_ANCHOR / BADGE_TARGET_WIDTH_PCT if it needs recalibration.

export const CARD_WIDTH = 1024
export const CARD_HEIGHT = 1536
export const CARD_ASPECT_RATIO = CARD_WIDTH / CARD_HEIGHT // width / height

// Zone where the background/character image sits, measured from card-font.png
export const IMAGE_AREA = {
  leftPct: 8.01,
  topPct: 21.61,
  widthPct: 81.74,
  heightPct: 58.53,
}

// Each rarity badge PNG has its own canvas size and the circle/ribbon shape
// sits at a different offset within it (measured via pixel bbox of non-transparent
// pixels). We scale each badge so its bbox width matches BADGE_TARGET_WIDTH_PCT
// of the card width, then position it so the bbox is centered on BADGE_ANCHOR.
export const RARITY_BADGES = {
  comun:       { file: 'badge_comun.png',       naturalSize: [332, 332], bbox: { x: 21, y: 12, w: 293, h: 308 } },
  infrecuente: { file: 'badge_infrecuente.png', naturalSize: [336, 336], bbox: { x: 16, y: 12, w: 304, h: 312 } },
  rara:        { file: 'badge_rara.png',        naturalSize: [351, 351], bbox: { x: 28, y: 12, w: 294, h: 327 } },
  epica:       { file: 'badge_epica.png',       naturalSize: [339, 339], bbox: { x: 18, y: 12, w: 303, h: 315 } },
  legendaria:  { file: 'badge_legendaria.png',  naturalSize: [423, 423], bbox: { x: 61, y: 12, w: 300, h: 399 } },
}

export const RARITY_OPTIONS = [
  { value: 'comun', label: 'Común' },
  { value: 'infrecuente', label: 'Infrecuente' },
  { value: 'rara', label: 'Rara' },
  { value: 'epica', label: 'Épica' },
  { value: 'legendaria', label: 'Legendaria' },
]

export const EFFECT_SUBTYPE_OPTIONS = [
  { value: 'instantaneo', label: 'Instantáneo' },
  { value: 'de_turno', label: 'De turno' },
  { value: 'permanente', label: 'Permanente' },
  { value: 'ritual', label: 'Ritual' },
]

// Anchor point for the *center* of each badge's bbox, as % of the card frame.
// Sits in the empty top-right corner of card-font.png.
export const BADGE_ANCHOR = { xPct: 86, yPct: 13 }
export const BADGE_TARGET_WIDTH_PCT = 19 // bbox width as % of card width

// Cost number rendered centered on top of the rarity badge's bbox.
export const COST_AREA = { ...BADGE_ANCHOR }

// Computes the position/size (in % of the card frame) of a rarity badge image
// so that its measured bbox is centered on BADGE_ANCHOR and its bbox width
// equals BADGE_TARGET_WIDTH_PCT.
export function getBadgeStyle(rarity) {
  const badge = RARITY_BADGES[rarity] || RARITY_BADGES.comun
  const [naturalW, naturalH] = badge.naturalSize
  const { x, y, w, h } = badge.bbox

  const scale = (BADGE_TARGET_WIDTH_PCT / 100 * CARD_WIDTH) / w
  const scaledW = naturalW * scale
  const scaledH = naturalH * scale
  const bboxCenterX = (x + w / 2) * scale
  const bboxCenterY = (y + h / 2) * scale

  return {
    leftPct: BADGE_ANCHOR.xPct - (bboxCenterX / CARD_WIDTH * 100),
    topPct: BADGE_ANCHOR.yPct - (bboxCenterY / CARD_HEIGHT * 100),
    widthPct: scaledW / CARD_WIDTH * 100,
    heightPct: scaledH / CARD_HEIGHT * 100,
  }
}

// Text layers — positions are % of card frame, fonts/colors per spec.
export const TEXT_AREAS = {
  name: {
    topPct: 2.5,
    leftPct: 6,
    widthPct: 88,
    heightPct: 11,
    fontFamily: "'Bebas Neue', sans-serif",
    color: '#ffffff',
    align: 'center',
  },
  subtype: {
    topPct: 14.5,
    leftPct: 6,
    widthPct: 88,
    heightPct: 5,
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 500,
    color: '#c8f060',
    align: 'center',
  },
  effectText: {
    topPct: 81,
    leftPct: 8,
    widthPct: 84,
    heightPct: 16,
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 400,
    color: '#e8e8ec',
    align: 'left',
  },
}
