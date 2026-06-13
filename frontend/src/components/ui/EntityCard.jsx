import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import styles from './EntityCard.module.css'

export default function EntityCard({ item, to, icon, subtitle, onEdit, onDelete }) {
  const { canEdit } = useAuth()
  return (
    <Link to={to} className={styles.card}>
      <div className={styles.top}>
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className={styles.img} />
        ) : (
          <div className={styles.iconBox}>{icon}</div>
        )}
        <div>
          <div className={styles.name}>{item.name}</div>
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
      </div>

      {item.description && <p className={styles.desc}>{item.description}</p>}

      {item.tags?.length > 0 && (
        <div className={styles.tags}>
          {item.tags.slice(0, 4).map(t => <span key={t} className={styles.tag}>{t}</span>)}
        </div>
      )}

      {canEdit && (
        <div className={styles.actions} onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>
          <button className={styles.btnEdit} onClick={() => onEdit(item)}>editar</button>
          <button className={styles.btnDelete} onClick={() => onDelete(item)}>eliminar</button>
        </div>
      )}
    </Link>
  )
}
