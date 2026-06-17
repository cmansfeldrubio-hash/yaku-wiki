import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { comicsApi } from '../api/comics'
import ComicForm from '../components/comic/ComicForm'
import styles from './ComicsPage.module.css'

export default function ComicsPage() {
  const { canEdit } = useAuth()
  const [comics, setComics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const addRef = useRef(null)

  useEffect(() => {
    comicsApi.list()
      .then(data => setComics(data.comics || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleCreated = (comic) => {
    setComics(prev => [comic, ...prev])
    setShowForm(false)
  }

  const handleUpdated = (comic) => {
    setComics(prev => prev.map(c => c.id === comic.id ? { ...c, ...comic } : c))
    setEditTarget(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este cómic y todas sus páginas?')) return
    try {
      await comicsApi.remove(id)
      setComics(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      alert(e.message)
    }
  }

  if (loading) return <div className={styles.state}>cargando cómics…</div>
  if (error)   return <div className={styles.state + ' ' + styles.error}>{error}</div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>cómics</h1>
        <p className={styles.subtitle}>historietas del universo yakutown</p>
      </div>

      {comics.length === 0 && !showForm && (
        <div className={styles.empty}>no hay cómics publicados aún.</div>
      )}

      <div className={styles.grid}>
        {comics.map(comic => (
          <div key={comic.id} className={styles.card}>
            <Link to={`/comics/${comic.slug}`} className={styles.cardLink}>
              <div className={styles.cover}>
                {comic.cover_url
                  ? <img src={comic.cover_url} alt={comic.title} className={styles.coverImg} />
                  : <div className={styles.coverPlaceholder}><span>sin portada</span></div>
                }
                <span className={`${styles.formatBadge} ${comic.format === 'manga' ? styles.manga : styles.normal}`}>
                  {comic.format}
                </span>
              </div>
              <div className={styles.info}>
                <div className={styles.comicTitle}>{comic.title}</div>
                {comic.description && <div className={styles.desc}>{comic.description}</div>}
                <div className={styles.pages}>{comic.page_count ?? 0} páginas</div>
              </div>
            </Link>

            {canEdit && (
              <div className={styles.actions}>
                <button className={styles.editBtn} onClick={() => setEditTarget(comic)}>editar</button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(comic.id)}>eliminar</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {canEdit && (
        <div className={styles.addSection} ref={addRef}>
          {showForm || editTarget ? (
            <ComicForm
              initial={editTarget || null}
              onSaved={editTarget ? handleUpdated : handleCreated}
              onCancel={() => { setShowForm(false); setEditTarget(null) }}
            />
          ) : (
            <button
              className={styles.addBtn}
              onClick={() => { setShowForm(true); setTimeout(() => addRef.current?.scrollIntoView({ behavior: 'smooth' }), 50) }}
            >
              + agregar cómic
            </button>
          )}
        </div>
      )}
    </div>
  )
}
