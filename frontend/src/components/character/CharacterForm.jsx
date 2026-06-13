import { useRef } from 'react'
import { useCharacterForm } from '../../hooks/useCharacterForm'
import styles from './CharacterForm.module.css'

const FACTIONS = [
  { value: 'yakuma', label: 'Yakuma' },
  { value: 'seis-siniestros', label: 'Los Seis Siniestros' },
  { value: 'npc', label: 'NPC' },
  { value: 'otro', label: 'Otro' },
]

const STATUSES = [
  { value: 'activo', label: 'Activo' },
  { value: 'leyenda', label: 'Leyenda' },
  { value: 'antagonista', label: 'Antagonista' },
  { value: 'sospechoso', label: 'Sospechoso' },
  { value: 'desconocido', label: 'Desconocido' },
]

export default function CharacterForm({ character, onSuccess, onCancel, showToast }) {
  const { fields, set, previewUrl, setImageFile, handleSubmit, saving, addSection, updateSection, removeSection, addAlias, updateAlias, removeAlias } = useCharacterForm(character)
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
      showToast(err.message || 'Error guardando el personaje', 'error')
    }
  }

  return (
    <>
      <div className={styles.grid}>
        <div className={styles.group}>
          <label className={styles.label}>nombre *</label>
          <input className={styles.input} value={fields.name} onChange={e => set('name', e.target.value)} placeholder="Nombre del personaje" />
        </div>
        <div className={styles.group}>
          <label className={styles.label}>origen (comuna)</label>
          <input className={styles.input} value={fields.origin} onChange={e => set('origin', e.target.value)} placeholder="Puente Alto, La Florida..." />
        </div>
        <div className={styles.group}>
          <label className={styles.label}>facción *</label>
          <select className={styles.select} value={fields.faction} onChange={e => set('faction', e.target.value)}>
            {FACTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div className={styles.group}>
          <label className={styles.label}>estado</label>
          <select className={styles.select} value={fields.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className={styles.group}>
          <label className={styles.label}>tags (separados por coma)</label>
          <input className={styles.input} value={fields.tags} onChange={e => set('tags', e.target.value)} placeholder="héroe, misterioso, foráneo" />
        </div>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.checkWrap}>
            <input type="checkbox" checked={fields.yakuma_title} onChange={e => set('yakuma_title', e.target.checked)} style={{ accentColor: 'var(--yakuma)' }} />
            <span>tiene título yakuma</span>
          </label>
        </div>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>también conocido como (alias)</label>
          <div className={styles.sections}>
            {fields.aliases.map((alias, i) => (
              <div key={i} className={styles.sectionBlockHeader}>
                <input
                  className={styles.input}
                  value={alias}
                  onChange={e => updateAlias(i, e.target.value)}
                  placeholder="El Duende..."
                />
                <button type="button" className={styles.btnRemoveSection} onClick={() => removeAlias(i)}>eliminar</button>
              </div>
            ))}
            <button type="button" className={styles.btnAddSection} onClick={addAlias}>+ agregar nombre</button>
          </div>
        </div>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>imagen del personaje</label>
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
          <textarea className={styles.textarea} value={fields.description} onChange={e => set('description', e.target.value)} placeholder="Quién es este personaje en Yakutown..." rows={4} />
        </div>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>hito yakuma</label>
          <textarea className={styles.textarea} value={fields.hito} onChange={e => set('hito', e.target.value)} placeholder="El evento que define su historia..." rows={2} />
        </div>
        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>poder / capacidad</label>
          <textarea className={styles.textarea} value={fields.poder} onChange={e => set('poder', e.target.value)} placeholder="Lo que lo hace único en Yakutown..." rows={2} />
        </div>

        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>secciones adicionales</label>
          <div className={styles.sections}>
            {fields.sections.map((section, i) => (
              <div key={i} className={styles.sectionBlock}>
                <div className={styles.sectionBlockHeader}>
                  <input
                    className={styles.input}
                    value={section.title}
                    onChange={e => updateSection(i, 'title', e.target.value)}
                    placeholder="título de la sección"
                  />
                  <button type="button" className={styles.btnRemoveSection} onClick={() => removeSection(i)}>eliminar</button>
                </div>
                <textarea
                  className={styles.textarea}
                  value={section.content}
                  onChange={e => updateSection(i, 'content', e.target.value)}
                  placeholder="contenido de la sección..."
                  rows={3}
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
          {saving ? 'guardando...' : 'guardar personaje'}
        </button>
      </div>
    </>
  )
}
