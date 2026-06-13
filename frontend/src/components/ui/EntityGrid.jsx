import EntityCard from './EntityCard'
import styles from './EntityGrid.module.css'

export default function EntityGrid({ items, loading, error, basePath, icon, getSubtitle, onEdit, onDelete, emptyLabel }) {
  if (loading) return (
    <div className={styles.empty}>
      <div className={styles.icon}>⬡</div>
      <p>cargando...</p>
    </div>
  )

  if (error) return (
    <div className={styles.empty}>
      <div className={styles.icon}>⚠</div>
      <p>No se pudo conectar con la API.<br />Asegurate que el servidor esté corriendo en puerto 3001.</p>
    </div>
  )

  if (!items.length) return (
    <div className={styles.empty}>
      <div className={styles.icon}>⬡</div>
      <p>{emptyLabel}</p>
    </div>
  )

  return (
    <div className={styles.grid}>
      {items.map(item => (
        <EntityCard
          key={item.id}
          item={item}
          to={`${basePath}/${item.slug}`}
          icon={icon}
          subtitle={getSubtitle ? getSubtitle(item) : null}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
