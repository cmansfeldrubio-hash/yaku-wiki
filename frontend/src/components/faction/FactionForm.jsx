import { useState } from 'react'
import { createFaction } from '../../api/factions'
import styles from './FactionForm.module.css'

export default function FactionForm({ onSuccess, onCancel, showToast }) {
  const [label, setLabel] = useState('')
  const [color, setColor] = useState('#808080')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!label.trim()) { showToast('El nombre es requerido', 'error'); return }
    setSaving(true)
    try {
      await createFaction({ label: label.trim(), color })
      showToast(`Facción "${label}" creada`, 'success')
      onSuccess()
    } catch (e) {
      showToast(e.message || 'Error creando la facción', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className={styles.grid}>
        <div className={styles.group}>
          <label className={styles.label}>nombre de la facción *</label>
          <input
            className={styles.input}
            autoFocus
            value={label}
            onChange={e => setLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="Los Inmortales..."
          />
        </div>
        <div className={styles.group}>
          <label className={styles.label}>color de acento</label>
          <div className={styles.colorRow}>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className={styles.colorPicker} />
            <span className={styles.colorHex}>{color}</span>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <button className={styles.btnCancel} onClick={onCancel}>cancelar</button>
        <button className={styles.btnSave} onClick={handleSave} disabled={saving}>
          {saving ? 'creando...' : 'crear facción'}
        </button>
      </div>
    </>
  )
}
