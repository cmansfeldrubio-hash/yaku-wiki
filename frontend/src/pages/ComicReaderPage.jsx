import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { comicsApi } from '../api/comics'
import styles from './ComicReaderPage.module.css'

export default function ComicReaderPage() {
  const { slug } = useParams()
  const { canEdit } = useAuth()
  const [comic, setComic] = useState(null)
  const [pages, setPages] = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [readerMode, setReaderMode] = useState('single')
  const fileInputRef = useRef(null)
  const isManga = comic?.format === 'manga'

  const load = useCallback(() => {
    comicsApi.getBySlug(slug)
      .then(data => {
        setComic(data)
        setPages(data.pages || [])
        setCurrent(0)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') isManga ? prev() : next()
      if (e.key === 'ArrowLeft')  isManga ? next() : prev()
      if (e.key === 'ArrowDown')  next()
      if (e.key === 'ArrowUp')    prev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const next = () => setCurrent(c => Math.min(c + 1, pages.length - 1))
  const prev = () => setCurrent(c => Math.max(c - 1, 0))

  const handleUpload = async (files) => {
    if (!files?.length) return
    setUploading(true)
    try {
      let updated = [...pages]
      for (const file of Array.from(files)) {
        const page = await comicsApi.addPage(comic.id, file)
        updated = [...updated, page]
      }
      setPages(updated.sort((a, b) => a.page_number - b.page_number))
      setCurrent(updated.length - 1)
    } catch (e) {
      alert(e.message)
    } finally {
      setUploading(false)
      fileInputRef.current && (fileInputRef.current.value = '')
    }
  }

  const handleDeletePage = async (pageId) => {
    if (!confirm('¿Eliminar esta página?')) return
    try {
      await comicsApi.removePage(comic.id, pageId)
      const newPages = pages.filter(p => p.id !== pageId)
        .map((p, i) => ({ ...p, page_number: i + 1 }))
      setPages(newPages)
      setCurrent(c => Math.min(c, Math.max(0, newPages.length - 1)))
    } catch (e) {
      alert(e.message)
    }
  }

  if (loading) return <div className={styles.state}>cargando…</div>
  if (error)   return <div className={`${styles.state} ${styles.error}`}>{error}</div>
  if (!comic)  return null

  const page = pages[current]
  const total = pages.length

  return (
    <div className={`${styles.reader} ${isManga ? styles.mangaMode : ''}`}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <Link to="/comics" className={styles.back}>← cómics</Link>
        <div className={styles.comicMeta}>
          <span className={styles.comicName}>{comic.title}</span>
          <span className={`${styles.formatTag} ${isManga ? styles.manga : styles.normal}`}>{comic.format}</span>
        </div>
        <div className={styles.topRight}>
          <button
            className={`${styles.modeBtn} ${readerMode === 'strip' ? styles.active : ''}`}
            onClick={() => setReaderMode(m => m === 'strip' ? 'single' : 'strip')}
            title="Modo tira (scroll continuo)"
          >
            ☰
          </button>
          {canEdit && (
            <>
              <button
                className={styles.uploadBtn}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'subiendo…' : '+ páginas'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                style={{ display: 'none' }}
                onChange={e => handleUpload(e.target.files)}
              />
            </>
          )}
        </div>
      </div>

      {total === 0 ? (
        <div className={styles.empty}>
          {canEdit ? 'Sube páginas con el botón "+ páginas"' : 'Este cómic no tiene páginas aún.'}
        </div>
      ) : readerMode === 'strip' ? (
        /* Strip / scroll mode */
        <div className={`${styles.strip} ${isManga ? styles.stripManga : ''}`}>
          {pages.map((p, i) => (
            <div key={p.id} className={styles.stripPage}>
              <img src={p.image_url} alt={`Página ${p.page_number}`} className={styles.stripImg} />
              {canEdit && (
                <button className={styles.deletePageBtn} onClick={() => handleDeletePage(p.id)} title="Eliminar página">✕</button>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Single page mode */
        <div className={styles.viewer}>
          {/* Nav zones — left/right click */}
          <div
            className={`${styles.navZone} ${styles.navLeft}`}
            onClick={isManga ? next : prev}
            title={isManga ? 'Siguiente (manga)' : 'Anterior'}
          />
          <div
            className={`${styles.navZone} ${styles.navRight}`}
            onClick={isManga ? prev : next}
            title={isManga ? 'Anterior (manga)' : 'Siguiente'}
          />

          {page && (
            <div className={styles.pageWrap}>
              <img
                key={page.id}
                src={page.image_url}
                alt={`Página ${page.page_number}`}
                className={styles.pageImg}
              />
              {canEdit && (
                <button
                  className={styles.deleteCurrentBtn}
                  onClick={() => handleDeletePage(page.id)}
                  title="Eliminar esta página"
                >✕</button>
              )}
            </div>
          )}

          {/* Bottom controls */}
          <div className={styles.controls}>
            <button className={styles.navBtn} onClick={isManga ? next : prev} disabled={isManga ? current >= total - 1 : current <= 0}>
              {isManga ? '›' : '‹'}
            </button>
            <span className={styles.pageCount}>
              {isManga
                ? `${total - current} / ${total}`
                : `${current + 1} / ${total}`}
            </span>
            <button className={styles.navBtn} onClick={isManga ? prev : next} disabled={isManga ? current <= 0 : current >= total - 1}>
              {isManga ? '‹' : '›'}
            </button>
          </div>

          {/* Thumbnail strip */}
          {total > 1 && (
            <div className={`${styles.thumbs} ${isManga ? styles.thumbsManga : ''}`}>
              {pages.map((p, i) => (
                <button
                  key={p.id}
                  className={`${styles.thumb} ${i === current ? styles.thumbActive : ''}`}
                  onClick={() => setCurrent(i)}
                >
                  <img src={p.image_url} alt={`${p.page_number}`} />
                  <span>{p.page_number}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
