import Avatar from '../ui/Avatar'
import StatusBadge from '../ui/StatusBadge'
import { getFactionColor, getFactionBg } from '../../constants/factions'
import styles from './CharacterDetail.module.css'

export default function CharacterDetail({ character: c, onEdit }) {
  if (!c) return null
  const accentColor = getFactionColor(c.faction)

  return (
    <>
      <div className={styles.header}>
        {c.image_url ? (
          <img src={c.image_url} alt={c.name} className={styles.img}
            onError={(e) => { e.target.style.display = 'none' }} />
        ) : (
          <Avatar name={c.name} faction={c.faction} size={60} fontSize={20} />
        )}
        <div>
          <div className={styles.name}>{c.name}</div>
          <div className={styles.alias}>{c.aliases?.length > 0 ? `también conocido como: ${c.aliases.join(', ')}` : '—'}</div>
          <div className={styles.origin}>{c.origin || '—'}</div>
          <div style={{ marginTop: 8 }}>
            <StatusBadge status={c.status} yakuma_title={c.yakuma_title} />
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {c.description && <Section label="descripción" text={c.description} />}
        {c.hito && <Section label="hito" text={c.hito} />}
        {c.poder && <Section label="poder / capacidad" text={c.poder} />}
        {c.tags?.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>tags</div>
            <div className={styles.tags}>
              {c.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
            </div>
          </div>
        )}
        <div className={styles.dates}>
          creado {new Date(c.created_at).toLocaleDateString('es-CL')} · actualizado {new Date(c.updated_at).toLocaleDateString('es-CL')}
        </div>
      </div>
    </>
  )
}

function Section({ label, text }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{
        fontSize: 10,
        fontFamily: "'Space Mono', monospace",
        color: 'var(--text3)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: 6,
      }}>{label}</div>
      <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{text}</p>
    </div>
  )
}
