import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CardCanvas from '../components/cards/CardCanvas'
import CardForm from '../components/cards/CardForm'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import { exportCardPng, exportCardFile, downloadDataUrl } from '../utils/exportCard'
import { createCard } from '../api/cards'
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
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [exporting, setExporting] = useState(false)
  const [saving, setSaving] = useState(false)
  const cardRef = useRef(null)

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
            />
          </div>

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
