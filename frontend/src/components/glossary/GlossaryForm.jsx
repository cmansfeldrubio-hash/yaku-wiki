import { useGlossaryForm } from '../../hooks/useGlossaryForm'
import styles from '../ui/EntityForm.module.css'

export default function GlossaryForm({ term, onSuccess, onCancel, showToast }) {
  const { fields, set, handleSubmit, saving } = useGlossaryForm(term)

  const onSubmit = async () => {
    try {
      await handleSubmit()
      onSuccess()
    } catch (err) {
      showToast(err.message || 'Error guardando el concepto', 'error')
    }
  }

  return (
    <>
      <div className={styles.grid}>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>nombre *</label>
          <input className={styles.input} value={fields.name} onChange={e => set('name', e.target.value)} placeholder="Nombre del concepto" />
        </div>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>tags (separados por coma)</label>
          <input className={styles.input} value={fields.tags} onChange={e => set('tags', e.target.value)} placeholder="jerga, organización, lugar" />
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
