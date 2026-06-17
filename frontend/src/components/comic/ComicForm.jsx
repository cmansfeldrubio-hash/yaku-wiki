import { useState, useRef } from 'react'
import { comicsApi } from '../../api/comics'
import styles from './ComicForm.module.css'

export default function ComicForm({ initial = null, onSaved, onCancel }) {
  const isEdit = !!initial
  const [title, setTitle] = useState(initial?.title || '')
  const [format, setFormat] = useState(initial?.format || 'normal')
  const [description, setDescription] = useState(initial?.description || '')
  const [cover, setCover] = useState(null)
  const [preview, setPreview] = useState(initial?.cover_url || null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  const handleCover = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCover(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { setError('El título es requerido'); return }
    setSaving(true)
    setError(null)
    try {
      const payload = { title, format, description, cover }
      const saved = isEdit
        ? await comicsApi.update(initial.id, payload)
        : await comicsApi.create(payload)
      onSaved(saved)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.head}>
        <h3 className={styles.formTitle}>{isEdit ? 'editar cómic' : 'nuevo cómic'}</h3>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.body}>
        {/* Cover upload */}
        <div className={styles.coverSection}>
          <div
            className={styles.coverPreview}
            onClick={() => fileRef.current?.click()}
            title="Subir portada"
          >
            {preview
              ? <img src={preview} alt="portada" className={styles.coverImg} />
              : <span className={styles.coverHint}>+ portada</span>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCover} />
        </div>

        <div className={styles.fields}>
          <label className={styles.label}>
            título
            <input
              className={styles.input}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="nombre del cómic"
              required
            />
          </label>

          <label className={styles.label}>
            formato
            <div className={styles.formatToggle}>
              {['normal', 'manga'].map(f => (
                <button
                  key={f}
                  type="button"
                  className={`${styles.formatBtn} ${format === f ? styles.formatActive : ''}`}
                  onClick={() => setFormat(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </label>

          <label className={styles.label}>
            descripción
            <textarea
              className={styles.textarea}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="descripción corta (opcional)"
              rows={3}
            />
          </label>
        </div>
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>cancelar</button>
        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? 'guardando…' : isEdit ? 'guardar cambios' : 'crear cómic'}
        </button>
      </div>
    </form>
  )
}
