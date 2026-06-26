import { useRef } from 'react'
import { useGameForm } from '../../hooks/useGameForm'
import styles from '../ui/EntityForm.module.css'

export default function GameForm({ game, onSuccess, onCancel, showToast }) {
  const { fields, set, previewUrl, setImageFile, handleSubmit, saving } = useGameForm(game)
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
      showToast(err.message || 'Error guardando el juego', 'error')
    }
  }

  return (
    <>
      <div className={styles.grid}>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>nombre *</label>
          <input className={styles.input} value={fields.name} onChange={e => set('name', e.target.value)} placeholder="Nombre del juego" />
        </div>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>URL del juego *</label>
          <input className={styles.input} value={fields.url} onChange={e => set('url', e.target.value)} placeholder="https://ejemplo.com/juego" />
        </div>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>imagen del juego</label>
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
          <textarea className={styles.textarea} value={fields.description} onChange={e => set('description', e.target.value)} placeholder="De qué trata este juego..." rows={3} />
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.btnCancel} onClick={onCancel}>cancelar</button>
        <button className={styles.btnSave} onClick={onSubmit} disabled={saving}>
          {saving ? 'guardando...' : 'guardar juego'}
        </button>
      </div>
    </>
  )
}
