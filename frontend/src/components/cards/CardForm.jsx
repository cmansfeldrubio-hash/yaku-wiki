import { useEffect, useMemo } from 'react'
import { useFactions } from '../../hooks/useFactions'
import { useCharacters } from '../../hooks/useCharacters'
import { RARITY_OPTIONS, EFFECT_SUBTYPE_OPTIONS } from '../../utils/cardLayout'
import styles from '../../pages/CardMakerPage.module.css'

export const MAX_IMAGE_SIZE = 4 * 1024 * 1024 // 4MB — backend/Vercel limit

export default function CardForm({ form, setForm, showToast }) {
  const { factions } = useFactions()
  const { characters } = useCharacters(form.factionId, '')

  const selectedCharacter = useMemo(
    () => characters.find(c => c.id === form.characterId) || null,
    [characters, form.characterId]
  )

  // Auto-fill name/subtype/image from the selected character.
  useEffect(() => {
    if (form.cardType !== 'personaje' || !selectedCharacter) return
    const faction = factions.find(f => f.id === selectedCharacter.faction)
    setForm(f => ({
      ...f,
      name: selectedCharacter.name || '',
      subtype: faction?.label || '',
      imageUrl: selectedCharacter.image_url || '',
      imageFile: null,
    }))
  }, [selectedCharacter, factions, form.cardType, setForm])

  const handleType = (cardType) => {
    setForm(f => ({
      ...f,
      cardType,
      factionId: '',
      characterId: '',
      name: '',
      subtype: '',
      imageUrl: '',
      imageFile: null,
    }))
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > MAX_IMAGE_SIZE) {
      showToast?.('La imagen pesa demasiado (máx. 4MB).', 'error')
      e.target.value = ''
      return
    }
    setForm(f => ({ ...f, imageFile: file, imageUrl: URL.createObjectURL(file) }))
  }

  return (
    <>
      <div className={styles.formGroup}>
        <label className={styles.label}>tipo de carta</label>
        <div className={styles.typeToggle}>
          <button
            type="button"
            className={`${styles.typeBtn} ${form.cardType === 'personaje' ? styles.typeBtnActive : ''}`}
            onClick={() => handleType('personaje')}
          >
            personaje
          </button>
          <button
            type="button"
            className={`${styles.typeBtn} ${form.cardType === 'efecto' ? styles.typeBtnActive : ''}`}
            onClick={() => handleType('efecto')}
          >
            efecto
          </button>
        </div>
      </div>

      {form.cardType === 'personaje' ? (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>facción</label>
            <select
              className={styles.input}
              value={form.factionId}
              onChange={e => setForm(f => ({ ...f, factionId: e.target.value, characterId: '' }))}
            >
              <option value="">selecciona una facción...</option>
              {factions.map(f => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>personaje</label>
            <select
              className={styles.input}
              value={form.characterId}
              onChange={e => setForm(f => ({ ...f, characterId: e.target.value }))}
              disabled={!form.factionId}
            >
              <option value="">selecciona un personaje...</option>
              {characters.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>nombre de la carta</label>
            <input
              className={styles.input}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="nombre..."
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>subtipo</label>
            <select
              className={styles.input}
              value={form.subtype}
              onChange={e => setForm(f => ({ ...f, subtype: e.target.value }))}
            >
              <option value="">selecciona un subtipo...</option>
              {EFFECT_SUBTYPE_OPTIONS.map(o => (
                <option key={o.value} value={o.label}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>imagen</label>
            <div className={styles.imageArea} onClick={() => document.getElementById('card-image-input').click()}>
              {form.imageUrl
                ? <img src={form.imageUrl} alt="preview" className={styles.preview} />
                : <span className={styles.imagePlaceholder}>click para elegir una imagen</span>
              }
            </div>
            <input id="card-image-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          </div>
        </>
      )}

      <div className={styles.formGroup}>
        <label className={styles.label}>rareza</label>
        <select
          className={styles.input}
          value={form.rarity}
          onChange={e => setForm(f => ({ ...f, rarity: e.target.value }))}
        >
          {RARITY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>costo</label>
        <input
          className={styles.input}
          type="number"
          min={0}
          max={9}
          value={form.cost}
          onChange={e => {
            const v = e.target.value
            if (v === '') { setForm(f => ({ ...f, cost: '' })); return }
            const n = Math.min(9, Math.max(0, Number(v)))
            setForm(f => ({ ...f, cost: n }))
          }}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>texto de efecto</label>
        <textarea
          className={styles.textarea}
          value={form.effectText}
          onChange={e => setForm(f => ({ ...f, effectText: e.target.value }))}
          placeholder="describe el efecto de la carta..."
          rows={4}
        />
      </div>
    </>
  )
}
