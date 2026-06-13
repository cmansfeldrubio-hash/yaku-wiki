import { useState } from 'react'
import styles from './CharacterTagPicker.module.css'

export default function CharacterTagPicker({ characters, selectedIds, onToggle, placeholder = 'buscar personaje...' }) {
  const [filter, setFilter] = useState('')

  const selected = characters.filter(c => selectedIds.includes(c.id))
  const filtered = characters.filter(c =>
    !selectedIds.includes(c.id) && c.name.toLowerCase().includes(filter.trim().toLowerCase())
  )

  return (
    <div className={styles.picker}>
      {selected.length > 0 && (
        <div className={styles.selected}>
          {selected.map(c => (
            <span key={c.id} className={styles.chip}>
              {c.name}
              <button type="button" className={styles.chipRemove} onClick={() => onToggle(c.id)}>×</button>
            </span>
          ))}
        </div>
      )}

      <input
        className={styles.search}
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder={placeholder}
      />

      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>sin resultados</div>
        ) : (
          filtered.map(c => (
            <label key={c.id} className={styles.option}>
              <input type="checkbox" checked={false} onChange={() => onToggle(c.id)} />
              <span>{c.name}</span>
            </label>
          ))
        )}
      </div>
    </div>
  )
}
