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

// Anchor point for the *center* of each badge's bbox, as % of the card frame,
// and the bbox width as % of the card width. Sits in the empty top-right
// corner of card-font.png, over the gray ring decoration. The painted frame
// artwork only covers y in [9.5%, 89.7%], so yPct must leave enough headroom
// for the tallest badge (legendaria) not to poke out above the card.
export const BADGE_LAYOUT = { xPct: 85, yPct: 20, widthPct: 19 }

// Cost number rendered centered on top of the rarity badge's bbox.
export const COST_LAYOUT = { xPct: 85, yPct: 20, fontSizeCqw: 5 }

// Computes the position/size (in % of the card frame) of a rarity badge image
// so that its measured bbox is centered on badgeLayout.xPct/yPct and its bbox
// width equals badgeLayout.widthPct.
export function getBadgeStyle(rarity, badgeLayout = BADGE_LAYOUT) {
  const badge = RARITY_BADGES[rarity] || RARITY_BADGES.comun
  const [naturalW, naturalH] = badge.naturalSize
  const { x, y, w, h } = badge.bbox

  const scale = (badgeLayout.widthPct / 100 * CARD_WIDTH) / w
  const scaledW = naturalW * scale
  const scaledH = naturalH * scale
  const bboxCenterX = (x + w / 2) * scale
  const bboxCenterY = (y + h / 2) * scale

  return {
    leftPct: badgeLayout.xPct - (bboxCenterX / CARD_WIDTH * 100),
    topPct: badgeLayout.yPct - (bboxCenterY / CARD_HEIGHT * 100),
    widthPct: scaledW / CARD_WIDTH * 100,
    heightPct: scaledH / CARD_HEIGHT * 100,
  }
}

// Text layers — positions are % of card frame, fonts/colors per spec.
// All three text fields sit in the dark plate below the image area: subtype
// (facción) and name share a top row, and effectText fills the larger
// paragraph area below them.
export const TEXT_AREAS = {
  name: {
    topPct: 66.5,
    leftPct: 48,
    widthPct: 43,
    heightPct: 5.5,
    fontSizeCqw: 8,
    fontFamily: "'Bebas Neue', sans-serif",
    color: '#ffffff',
    align: 'right',
  },
  subtype: {
    topPct: 66.5,
    leftPct: 9,
    widthPct: 37,
    heightPct: 5.5,
    fontSizeCqw: 2.6,
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 500,
    color: '#c8f060',
    align: 'left',
  },
  effectText: {
    topPct: 73,
    leftPct: 8,
    widthPct: 84,
    heightPct: 12,
    fontSizeCqw: 2.4,
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 400,
    color: '#e8e8ec',
    align: 'left',
  },
}

// Owner-only layout editor: lets the owner drag/resize the name, subtype and
// effectText boxes and tweak their font size, persisted per-browser so the
// card maker preview reflects their tuning across sessions.
const LAYOUT_OVERRIDES_KEY = 'yakutown_card_layout_overrides'
const OVERRIDABLE_FIELDS = ['topPct', 'leftPct', 'widthPct', 'heightPct', 'fontSizeCqw']

export function loadLayoutOverrides() {
  try {
    const raw = localStorage.getItem(LAYOUT_OVERRIDES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveLayoutOverrides(overrides) {
  try {
    localStorage.setItem(LAYOUT_OVERRIDES_KEY, JSON.stringify(overrides))
  } catch {
    // ignore (e.g. storage disabled)
  }
}

// Merges TEXT_AREAS defaults with per-field overrides for each text area.
export function getEffectiveTextAreas(overrides = {}) {
  const result = {}
  for (const key of Object.keys(TEXT_AREAS)) {
    const base = TEXT_AREAS[key]
    const override = overrides[key]
    if (!override) { result[key] = base; continue }
    const merged = { ...base }
    for (const field of OVERRIDABLE_FIELDS) {
      if (override[field] !== undefined) merged[field] = override[field]
    }
    result[key] = merged
  }
  return result
}

export function getEffectiveBadgeLayout(overrides = {}) {
  return { ...BADGE_LAYOUT, ...(overrides.badge || {}) }
}

export function getEffectiveCostLayout(overrides = {}) {
  return { ...COST_LAYOUT, ...(overrides.cost || {}) }
}

// Merges IMAGE_AREA defaults with the position/size override, clamped so the
// photo box never moves outside the card frame.
export function getEffectiveImageArea(overrides = {}) {
  const base = IMAGE_AREA
  const override = overrides.image
  if (!override) return base
  const merged = { ...base }
  for (const field of ['topPct', 'leftPct', 'widthPct', 'heightPct']) {
    if (override[field] !== undefined) merged[field] = override[field]
  }
  merged.widthPct = Math.min(merged.widthPct, 100)
  merged.heightPct = Math.min(merged.heightPct, 100)
  merged.leftPct = Math.min(Math.max(merged.leftPct, 0), 100 - merged.widthPct)
  merged.topPct = Math.min(Math.max(merged.topPct, 0), 100 - merged.heightPct)
  return merged
}
