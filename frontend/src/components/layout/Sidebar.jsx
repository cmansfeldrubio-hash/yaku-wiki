import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import styles from './Sidebar.module.css'

export default function Sidebar({ factions, totalCount, activeFaction, onFactionChange, onNewFaction, onNewCharacter }) {
  const { canEdit } = useAuth()

  return (
    <aside className={styles.aside}>
      <div className={styles.section}>
        <div className={styles.label}>Facciones</div>
        <button
          className={`${styles.btn} ${activeFaction === '' ? styles.active : ''}`}
          onClick={() => onFactionChange('')}
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
            onClick={() => onFactionChange(f.id)}
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
  )
}
