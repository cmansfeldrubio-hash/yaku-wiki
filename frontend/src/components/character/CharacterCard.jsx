import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../hooks/useAuth'
import { getFactionColor } from '../../constants/factions'
import styles from './CharacterCard.module.css'

export default function CharacterCard({ character: c, onEdit, onDelete }) {
  const { canEdit } = useAuth()
  const accentColor = getFactionColor(c.faction)

  return (
    <Link
      to={`/personaje/${c.slug}`}
      className={styles.card}
      style={{ borderLeft: `3px solid ${accentColor}` }}
    >
      {c.yakuma_title && <span className={styles.yakumaBadge}>yakuma</span>}

      <div className={styles.top}>
        {c.image_url ? (
          <img
            src={c.image_url}
            alt={c.name}
            className={styles.img}
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
          />
        ) : (
          <Avatar name={c.name} faction={c.faction} />
        )}
        {c.image_url && <Avatar name={c.name} faction={c.faction} style={{ display: 'none' }} />}
        <div>
          <div className={styles.name}>{c.name}</div>
          <div className={styles.alias}>{c.alias || '—'}</div>
          <div className={styles.origin}>{c.origin || '—'}</div>
        </div>
      </div>

      {c.description && <p className={styles.desc}>{c.description}</p>}

      {c.tags?.length > 0 && (
        <div className={styles.tags}>
          {c.tags.slice(0, 4).map(t => <span key={t} className={styles.tag}>{t}</span>)}
        </div>
      )}

      {canEdit && (
        <div className={styles.actions} onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>
          <button className={styles.btnEdit} onClick={() => onEdit(c)}>editar</button>
          <button className={styles.btnDelete} onClick={() => onDelete(c)}>eliminar</button>
        </div>
      )}
    </Link>
  )
}
