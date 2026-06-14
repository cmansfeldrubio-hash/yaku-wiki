import { useState } from 'react'
import { useGlossaryForm } from '../../hooks/useGlossaryForm'
import { useGlossaryTags } from '../../hooks/useGlossaryTags'
import styles from '../ui/EntityForm.module.css'

export default function GlossaryForm({ term, onSuccess, onCancel, showToast }) {
  const { fields, set, toggleTag, addTag, handleSubmit, saving } = useGlossaryForm(term)
  const { tags: existingTags, reload: reloadTags } = useGlossaryTags()
  const [newTag, setNewTag] = useState('')

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
                <button
                  type="button"
                  key={tag}
                  className={`${styles.tagOption} ${fields.tags.includes(tag) ? styles.tagOptionActive : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
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
