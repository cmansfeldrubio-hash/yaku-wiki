import { useRef } from 'react'
import { useEventForm } from '../../hooks/useEventForm'
import { useEntityList } from '../../hooks/useEntityList'
import { getLocations } from '../../api/locations'
import styles from '../ui/EntityForm.module.css'

export default function EventForm({ event, onSuccess, onCancel, showToast }) {
  const { fields, set, previewUrl, setImageFile, handleSubmit, saving } = useEventForm(event)
  const { items: locations } = useEntityList(getLocations)
  const fileRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImageFile(file, url)
  }

  const onSubmit = async () => {
    try {
      await handleSubmit()
      onSuccess()
    } catch (err) {
      showToast(err.message || 'Error guardando el evento', 'error')
    }
  }

  return (
    <>
      <div className={styles.grid}>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>nombre *</label>
          <input className={styles.input} value={fields.name} onChange={e => set('name', e.target.value)} placeholder="Nombre del evento" />
        </div>
        <div className={styles.group}>
          <label className={styles.label}>fecha</label>
          <input className={styles.input} value={fields.date} onChange={e => set('date', e.target.value)} placeholder="2010, marzo de 2012..." />
        </div>
        <div className={styles.group}>
          <label className={styles.label}>ubicación</label>
          <select className={styles.select} value={fields.location_id} onChange={e => set('location_id', e.target.value)}>
            <option value="">— sin ubicación —</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>tags (separados por coma)</label>
          <input className={styles.input} value={fields.tags} onChange={e => set('tags', e.target.value)} placeholder="fundacional, conflicto, fiesta" />
        </div>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>imagen del evento</label>
          <div
            className={`${styles.imageArea} ${previewUrl ? styles.hasImage : ''}`}
            onClick={() => fileRef.current.click()}
          >
            {previewUrl
              ? <img src={previewUrl} alt="preview" className={styles.preview} />
              : <span className={styles.imagePlaceholder}>click para subir imagen</span>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>descripción</label>
          <textarea className={styles.textarea} value={fields.description} onChange={e => set('description', e.target.value)} placeholder="Qué pasó en este evento..." rows={4} />
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.btnCancel} onClick={onCancel}>cancelar</button>
        <button className={styles.btnSave} onClick={onSubmit} disabled={saving}>
          {saving ? 'guardando...' : 'guardar evento'}
        </button>
      </div>
    </>
  )
}
