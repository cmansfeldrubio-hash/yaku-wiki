import { useRef } from 'react'
import { useYakumeadaForm } from '../../hooks/useYakumeadaForm'
import styles from '../ui/EntityForm.module.css'

export default function YakumeadaForm({ yakumeada, onSuccess, onCancel, showToast }) {
  const { fields, set, previewUrl, setImageFile, handleSubmit, saving } = useYakumeadaForm(yakumeada)
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
      showToast(err.message || 'Error guardando la yakumeada', 'error')
    }
  }

  return (
    <>
      <div className={styles.grid}>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>título *</label>
          <input className={styles.input} value={fields.name} onChange={e => set('name', e.target.value)} placeholder="Título de la yakumeada" />
        </div>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>extracto</label>
          <input className={styles.input} value={fields.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="Resumen corto para la portada" />
        </div>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>tags (separados por coma)</label>
          <input className={styles.input} value={fields.tags} onChange={e => set('tags', e.target.value)} placeholder="noticias, yakuma, comunidad" />
        </div>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>foto</label>
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
          <label className={styles.label}>contenido</label>
          <textarea className={styles.textarea} value={fields.content} onChange={e => set('content', e.target.value)} placeholder="Escribe la yakumeada..." rows={8} />
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.btnCancel} onClick={onCancel}>cancelar</button>
        <button className={styles.btnSave} onClick={onSubmit} disabled={saving}>
          {saving ? 'guardando...' : 'guardar yakumeada'}
        </button>
      </div>
    </>
  )
}
