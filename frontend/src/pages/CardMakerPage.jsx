import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CardCanvas from '../components/cards/CardCanvas'
import CardForm from '../components/cards/CardForm'
import CardLayoutEditor from '../components/cards/CardLayoutEditor'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import { exportCardPng, exportCardFile, downloadDataUrl } from '../utils/exportCard'
import { createCard } from '../api/cards'
import { getCardLayout, updateCardLayout } from '../api/cardLayout'
import {
  loadLayoutOverrides,
  saveLayoutOverrides,
  getEffectiveTextAreas,
  getEffectiveBadgeLayout,
  getEffectiveCostLayout,
  getEffectiveImageArea,
  getBadgeStyle,
} from '../utils/cardLayout'

const TEXT_KEYS = ['name', 'subtype', 'effectText']
const TEXT_LABELS = { name: 'nombre', subtype: 'facción', effectText: 'efecto' }
const clamp = (v, min, max) => Math.min(Math.max(v, min), max)
import styles from './CardMakerPage.module.css'

const EMPTY_FORM = {
  cardType: 'personaje',
  factionId: '',
  characterId: '',
  name: '',
  subtype: '',
  rarity: 'comun',
  cost: '',
  effectText: '',
  imageUrl: '',
  imageFile: null,
}

export default function CardMakerPage() {
  const { showToast } = useToast()
  const { user, isOwner } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [exporting, setExporting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [imageEditMode, setImageEditMode] = useState(false)
  // Text/badge/cost layout is shared globally (owner edits affect everyone).
  const [sharedOverrides, setSharedOverrides] = useState({})
  // The image position/size is per-browser only, kept in localStorage.
  const [imageOverride, setImageOverride] = useState(() => loadLayoutOverrides().image)
  const cardRef = useRef(null)

  useEffect(() => {
    getCardLayout()
      .then(data => setSharedOverrides(data.overrides || {}))
      .catch(() => {})
  }, [])

  const layoutOverrides = useMemo(() => ({
    ...sharedOverrides,
    ...(imageOverride ? { image: imageOverride } : {}),
  }), [sharedOverrides, imageOverride])

  const applyOverride = (key, value) => {
    if (key === 'image') {
      setImageOverride(value)
      saveLayoutOverrides({ image: value })
      return
    }
    setSharedOverrides(prev => {
      const next = { ...prev, [key]: value }
      updateCardLayout(next).catch(() => {})
      return next
    })
  }

  const handleResetLayout = () => {
    setSharedOverrides({})
    updateCardLayout({}).catch(() => {})
  }

  const handleResetImage = () => {
    setImageOverride(undefined)
    saveLayoutOverrides({})
  }

  const effectiveText = getEffectiveTextAreas(layoutOverrides)
  const effectiveBadge = getEffectiveBadgeLayout(layoutOverrides)
  const effectiveCost = getEffectiveCostLayout(layoutOverrides)
  const effectiveImage = getEffectiveImageArea(layoutOverrides)

  const handleMove = (key, dx, dy) => {
    if (TEXT_KEYS.includes(key)) {
      const cur = effectiveText[key]
      applyOverride(key, {
        ...cur,
        leftPct: clamp(cur.leftPct + dx, 0, 100 - cur.widthPct),
        topPct: clamp(cur.topPct + dy, 0, 100 - cur.heightPct),
      })
    } else if (key === 'image') {
      applyOverride('image', {
        ...effectiveImage,
        leftPct: clamp(effectiveImage.leftPct + dx, 0, 100 - effectiveImage.widthPct),
        topPct: clamp(effectiveImage.topPct + dy, 0, 100 - effectiveImage.heightPct),
      })
    } else if (key === 'badge') {
      applyOverride('badge', {
        ...effectiveBadge,
        xPct: clamp(effectiveBadge.xPct + dx, 0, 100),
        yPct: clamp(effectiveBadge.yPct + dy, 0, 100),
      })
    } else if (key === 'cost') {
      applyOverride('cost', {
        ...effectiveCost,
        xPct: clamp(effectiveCost.xPct + dx, 0, 100),
        yPct: clamp(effectiveCost.yPct + dy, 0, 100),
      })
    }
  }

  const handleResize = (key, dw, dh) => {
    if (TEXT_KEYS.includes(key)) {
      const cur = effectiveText[key]
      applyOverride(key, {
        ...cur,
        widthPct: clamp(cur.widthPct + dw, 5, 100 - cur.leftPct),
        heightPct: clamp(cur.heightPct + dh, 2, 100 - cur.topPct),
      })
    } else if (key === 'image') {
      applyOverride('image', {
        ...effectiveImage,
        widthPct: clamp(effectiveImage.widthPct + dw, 5, 100 - effectiveImage.leftPct),
        heightPct: clamp(effectiveImage.heightPct + dh, 5, 100 - effectiveImage.topPct),
      })
    } else if (key === 'badge') {
      applyOverride('badge', {
        ...effectiveBadge,
        widthPct: clamp(effectiveBadge.widthPct + dw, 5, 60),
      })
    }
  }

  const handleScale = (key, dir) => {
    if (key === 'image') {
      const factor = dir > 0 ? 1.08 : 1 / 1.08
      const widthPct = clamp(effectiveImage.widthPct * factor, 5, 100 - effectiveImage.leftPct)
      const heightPct = clamp(effectiveImage.heightPct * factor, 5, 100 - effectiveImage.topPct)
      applyOverride('image', { ...effectiveImage, widthPct, heightPct })
    }
  }

  const handleFontSize = (key, delta) => {
    if (TEXT_KEYS.includes(key)) {
      const cur = effectiveText[key]
      applyOverride(key, { ...cur, fontSizeCqw: Math.max(0.5, +(cur.fontSizeCqw + delta).toFixed(1)) })
    } else if (key === 'cost') {
      applyOverride('cost', { ...effectiveCost, fontSizeCqw: Math.max(0.5, +(effectiveCost.fontSizeCqw + delta).toFixed(1)) })
    }
  }

  const badgeBox = getBadgeStyle(form.rarity, effectiveBadge)
  const imageBox = {
    key: 'image',
    label: 'imagen',
    leftPct: effectiveImage.leftPct,
    topPct: effectiveImage.topPct,
    widthPct: effectiveImage.widthPct,
    heightPct: effectiveImage.heightPct,
    resizable: true,
    scalable: true,
  }
  const layoutBoxes = [
    ...TEXT_KEYS.map(key => ({
      key,
      label: TEXT_LABELS[key],
      leftPct: effectiveText[key].leftPct,
      topPct: effectiveText[key].topPct,
      widthPct: effectiveText[key].widthPct,
      heightPct: effectiveText[key].heightPct,
      fontSizeCqw: effectiveText[key].fontSizeCqw,
      resizable: true,
    })),
    {
      key: 'badge',
      label: 'rareza',
      leftPct: badgeBox.leftPct,
      topPct: badgeBox.topPct,
      widthPct: badgeBox.widthPct,
      heightPct: badgeBox.heightPct,
      resizable: true,
    },
    {
      key: 'cost',
      label: 'costo',
      leftPct: effectiveCost.xPct - 7,
      topPct: effectiveCost.yPct - 4,
      widthPct: 14,
      heightPct: 8,
      fontSizeCqw: effectiveCost.fontSizeCqw,
      resizable: false,
    },
    imageBox,
  ]

  const validate = () => {
    if (!form.name.trim()) { showToast('Ponle un nombre a la carta', 'error'); return false }
    if (form.cardType === 'personaje' && !form.characterId) { showToast('Selecciona un personaje', 'error'); return false }
    return true
  }

  const handleDownload = async () => {
    if (!validate()) return
    setExporting(true)
    try {
      const dataUrl = await exportCardPng(cardRef.current)
      const filename = `${(form.name || 'carta').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`
      downloadDataUrl(dataUrl, filename)
    } catch (e) {
      showToast('No se pudo exportar la carta. ' + (e.message || ''), 'error')
    } finally {
      setExporting(false)
    }
  }

  const handleSave = async () => {
    if (!user) { showToast('Inicia sesión para guardar la carta en la galería', 'error'); return }
    if (!validate()) return
    setSaving(true)
    try {
      const file = await exportCardFile(cardRef.current, 'carta.png')
      const card = await createCard({
        file,
        cardType: form.cardType,
        name: form.name,
        subtype: form.subtype,
        rarity: form.rarity,
        cost: form.cost === '' ? 0 : form.cost,
        effectText: form.effectText,
        characterId: form.cardType === 'personaje' ? form.characterId : '',
      })
      showToast('Carta guardada en la galería', 'success')
      navigate('/cards', { state: { newCardId: card.id } })
    } catch (e) {
      showToast(e.message || 'Error guardando la carta', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <Link to="/cards" className={styles.breadcrumb}>
        <span className={styles.breadcrumbArrow}>←</span>
        <span>volver a la galería de cartas</span>
      </Link>

      <h1 className={styles.title}>crear carta</h1>

      <div className={styles.layout}>
        <div className={styles.formCol}>
          <CardForm form={form} setForm={setForm} showToast={showToast} />
        </div>

        <div className={styles.previewCol}>
          <div className={styles.previewWrap}>
            <CardCanvas
              ref={cardRef}
              name={form.name}
              subtype={form.subtype}
              rarity={form.rarity}
              cost={form.cost}
              effectText={form.effectText}
              imageUrl={form.imageUrl}
              layoutOverrides={layoutOverrides}
            />
            {isOwner && editMode && (
              <CardLayoutEditor
                boxes={layoutBoxes}
                onMove={handleMove}
                onResize={handleResize}
                onFontSize={handleFontSize}
                onScale={handleScale}
                containerRef={cardRef}
              />
            )}
            {!isOwner && imageEditMode && (
              <CardLayoutEditor
                boxes={[imageBox]}
                onMove={handleMove}
                onResize={handleResize}
                onFontSize={handleFontSize}
                onScale={handleScale}
                containerRef={cardRef}
              />
            )}
          </div>

          {isOwner ? (
            <div className={styles.actions}>
              <button className={styles.btnSecondary} onClick={() => setEditMode(m => !m)}>
                {editMode ? 'salir del modo edición' : 'modo edición'}
              </button>
              {editMode && (
                <button className={styles.btnSecondary} onClick={handleResetLayout}>
                  restablecer posiciones
                </button>
              )}
            </div>
          ) : (
            <div className={styles.actions}>
              <button className={styles.btnSecondary} onClick={() => setImageEditMode(m => !m)}>
                {imageEditMode ? 'listo' : 'ajustar imagen'}
              </button>
              {imageEditMode && (
                <button className={styles.btnSecondary} onClick={handleResetImage}>
                  restablecer imagen
                </button>
              )}
            </div>
          )}

          <div className={styles.actions}>
            <button className={styles.btnSecondary} onClick={handleDownload} disabled={exporting || saving}>
              {exporting ? 'exportando...' : 'descargar PNG'}
            </button>
            <button className={styles.btnPrimary} onClick={handleSave} disabled={exporting || saving}>
              {saving ? 'guardando...' : 'guardar en galería'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
