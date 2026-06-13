import CharacterCard from './CharacterCard'
import styles from './CharacterGrid.module.css'

export default function CharacterGrid({ characters, loading, error, onEdit, onDelete }) {
  if (loading) return (
    <div className={styles.empty}>
      <div className={styles.icon}>⬡</div>
      <p>Cargando personajes...</p>
    </div>
  )

  if (error) return (
    <div className={styles.empty}>
      <div className={styles.icon}>⚠</div>
      <p>No se pudo conectar con la API.<br />Asegurate que el servidor esté corriendo en puerto 3001.</p>
    </div>
  )

  if (!characters.length) return (
    <div className={styles.empty}>
      <div className={styles.icon}>⬡</div>
      <p>No hay personajes en esta categoría todavía.</p>
    </div>
  )

  return (
    <div className={styles.grid}>
      {characters.map(c => (
        <CharacterCard
          key={c.id}
          character={c}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
