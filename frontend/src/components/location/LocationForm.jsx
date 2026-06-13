import { useRef } from 'react'
import { useLocationForm } from '../../hooks/useLocationForm'
import styles from '../ui/EntityForm.module.css'

export default function LocationForm({ location, onSuccess, onCancel, showToast }) {
  const { fields, set, previewUrl, setImageFile, handleSubmit, saving } = useLocationForm(location)
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
      showToast(err.message || 'Error guardando la ubicación', 'error')
    }
  }

  return (
    <>
      <div className={styles.grid}>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>nombre *</label>
          <input className={styles.input} value={fields.name} onChange={e => set('name', e.target.value)} placeholder="Nombre de la ubicación" />
        </div>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>tipo</label>
          <input className={styles.input} value={fields.type} onChange={e => set('type', e.target.value)} placeholder="ciudad, edificio, distrito..." />
        </div>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>tags (separados por coma)</label>
          <input className={styles.input} value={fields.tags} onChange={e => set('tags', e.target.value)} placeholder="comercial, peligroso, ruinas" />
        </div>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>imagen de la ubicación</label>
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
          <textarea className={styles.textarea} value={fields.description} onChange={e => set('description', e.target.value)} placeholder="Descripción de la ubicación..." rows={4} />
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.btnCancel} onClick={onCancel}>cancelar</button>
        <button className={styles.btnSave} onClick={onSubmit} disabled={saving}>
          {saving ? 'guardando...' : 'guardar ubicación'}
        </button>
      </div>
    </>
  )
}
