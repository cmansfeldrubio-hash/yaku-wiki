import { useState, useRef } from 'react'
import { useGlossaryForm } from '../../hooks/useGlossaryForm'
import { useGlossaryTags } from '../../hooks/useGlossaryTags'
import styles from '../ui/EntityForm.module.css'

export default function GlossaryForm({ term, onSuccess, onCancel, showToast }) {
  const { fields, set, toggleTag, addTag, removeTagFromFields, previewUrl, setImageFile, handleSubmit, saving } = useGlossaryForm(term)
  const { tags: existingTags, reload: reloadTags, removeTag } = useGlossaryTags()
  const [newTag, setNewTag] = useState('')
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
      showToast(err.message || 'Error guardando el concepto', 'error')
    }
  }

  const handleAddTag = () => {
    const clean = newTag.trim()
    if (!clean) return
    addTag(clean)
    setNewTag('')
    reloadTags()
  }

  const handleDeleteTag = async (e, tag) => {
    e.stopPropagation()
    if (!window.confirm(`¿Eliminar el tag "${tag}" de la base de datos? Se quitará de todos los conceptos que lo usen.`)) return
    try {
      await removeTag(tag)
      removeTagFromFields(tag)
      showToast(`Tag "${tag}" eliminado`, 'success')
    } catch (err) {
      showToast(err.message || 'Error eliminando el tag', 'error')
    }
  }

  // Tags asignados al concepto que aún no existen en la lista general (recién creados)
  const allTags = [...new Set([...existingTags, ...fields.tags])].sort((a, b) => a.localeCompare(b))

  return (
    <>
      <div className={styles.grid}>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>nombre *</label>
          <input className={styles.input} value={fields.name} onChange={e => set('name', e.target.value)} placeholder="Nombre del concepto" />
        </div>

        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>tags</label>
          {allTags.length > 0 ? (
            <div className={styles.tagOptions}>
              {allTags.map(tag => (
                <div
                  key={tag}
                  className={`${styles.tagOptionWrap} ${fields.tags.includes(tag) ? styles.tagOptionActive : ''}`}
                >
                  <button type="button" className={styles.tagOption} onClick={() => toggleTag(tag)}>
                    {tag}
                  </button>
                  {existingTags.includes(tag) && (
                    <button
                      type="button"
                      className={styles.tagOptionRemove}
                      onClick={e => handleDeleteTag(e, tag)}
                      title={`eliminar tag "${tag}" de la base de datos`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.hint}>Todavía no hay tags creados.</p>
          )}
        </div>

        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>crear tag nuevo</label>
          <div className={styles.tagAddRow}>
            <input
              className={styles.input}
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag() } }}
              placeholder="nombre del nuevo tag"
            />
            <button type="button" className={styles.btnAddTag} onClick={handleAddTag}>agregar</button>
          </div>
        </div>

        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>descripción</label>
          <textarea className={styles.textarea} value={fields.description} onChange={e => set('description', e.target.value)} placeholder="Explicación del concepto..." rows={4} />
        </div>

        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>imagen</label>
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
      </div>

      <div className={styles.footer}>
        <button className={styles.btnCancel} onClick={onCancel}>cancelar</button>
        <button className={styles.btnSave} onClick={onSubmit} disabled={saving}>
          {saving ? 'guardando...' : 'guardar concepto'}
        </button>
      </div>
    </>
  )
}
