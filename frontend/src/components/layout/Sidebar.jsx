import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import styles from './Sidebar.module.css'

export default function Sidebar({ factions, totalCount, activeFaction, onFactionChange, onNewFaction, onNewCharacter }) {
  const { canEdit } = useAuth()
  const [open, setOpen] = useState(false)

  const handleFactionChange = (faction) => {
    onFactionChange(faction)
    setOpen(false)
  }

  return (
    <>
      {/* Mobile filter toggle button */}
      <button className={styles.filterToggle} onClick={() => setOpen(o => !o)}>
        <span className={styles.filterIcon}>☰</span>
        <span>filtros{activeFaction ? ` · ${factions.find(f => f.id === activeFaction)?.label || ''}` : ''}</span>
      </button>

      {/* Backdrop for mobile */}
      {open && <div className={styles.backdrop} onClick={() => setOpen(false)} />}

      <aside className={`${styles.aside} ${open ? styles.open : ''}`}>
        <div className={styles.mobileHeader}>
          <span className={styles.mobileTitle}>Filtros</span>
          <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>Facciones</div>
          <button
            className={`${styles.btn} ${activeFaction === '' ? styles.active : ''}`}
            onClick={() => handleFactionChange('')}
          >
            <span>
              <span className={styles.dot} style={{ background: '#606070' }} />
              Todos
            </span>
            <span className={styles.count}>{totalCount}</span>
          </button>
          {factions.map(f => (
            <button
              key={f.id}
              className={`${styles.btn} ${activeFaction === f.id ? styles.active : ''}`}
              onClick={() => handleFactionChange(f.id)}
            >
              <span>
                <span className={styles.dot} style={{ background: f.color }} />
                {f.label}
              </span>
              <span className={styles.count}>{f.count}</span>
            </button>
          ))}
        </div>

        <div className={styles.section}>
          <div className={styles.label}>Acciones</div>
          {canEdit && (
            <>
              <button className={styles.addBtn} onClick={onNewCharacter}>+ nuevo personaje</button>
              <button className={styles.addBtnSecondary} onClick={onNewFaction}>+ nueva facción</button>
            </>
          )}
          <Link to="/galeria" className={styles.addBtnSecondary} style={{ display: 'block', marginTop: 6, textDecoration: 'none' }}>
            galería de fotos
          </Link>
        </div>
      </aside>
    </>
  )
}
