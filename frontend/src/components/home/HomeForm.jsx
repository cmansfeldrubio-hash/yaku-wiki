import { useRef } from 'react'
import { useHomeForm } from '../../hooks/useHomeForm'
import styles from './HomeForm.module.css'

export default function HomeForm({ home, onSuccess, onCancel, showToast }) {
  const { fields, previewUrl, setImageFile, handleSubmit, saving, addSection, updateSection, removeSection } = useHomeForm(home)
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
      showToast(err.message || 'Error guardando la página de inicio', 'error')
    }
  }

  return (
    <>
      <div className={styles.grid}>
        <div className={styles.group}>
          <label className={styles.label}>banner (proporción 3:1)</label>
          <div
            className={`${styles.imageArea} ${previewUrl ? styles.hasImage : ''}`}
            onClick={() => fileRef.current.click()}
          >
            {previewUrl
              ? <img src={previewUrl} alt="preview" className={styles.preview} />
              : <span className={styles.imagePlaceholder}>click para subir banner</span>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>secciones</label>
          <div className={styles.sections}>
            {fields.sections.map((section, i) => (
              <div key={i} className={styles.sectionBlock}>
                <div className={styles.sectionBlockHeader}>
                  <input
                    className={styles.input}
                    value={section.title}
                    onChange={e => updateSection(i, 'title', e.target.value)}
                    placeholder="título de la sección (ej. objetivo de la wiki)"
                  />
                  <button type="button" className={styles.btnRemoveSection} onClick={() => removeSection(i)}>eliminar</button>
                </div>
                <textarea
                  className={styles.textarea}
                  value={section.content}
                  onChange={e => updateSection(i, 'content', e.target.value)}
                  placeholder="contenido de la sección..."
                  rows={4}
                />
              </div>
            ))}
            <button type="button" className={styles.btnAddSection} onClick={addSection}>+ agregar sección</button>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.btnCancel} onClick={onCancel}>cancelar</button>
        <button className={styles.btnSave} onClick={onSubmit} disabled={saving}>
          {saving ? 'guardando...' : 'guardar'}
        </button>
      </div>
    </>
  )
}
