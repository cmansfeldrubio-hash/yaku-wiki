import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Rows3, BookOpen, GripVertical, Trash2, Upload } from 'lucide-react'
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
  const [uploadProgress, setUploadProgress] = useState(null) // null | { done, total }
  const [readerMode, setReaderMode] = useState('single') // 'single' | 'strip'
  const [managing, setManaging] = useState(false)
  const [dragIdx, setDragIdx] = useState(null)
  const [savingOrder, setSavingOrder] = useState(false)
  const [orderChanged, setOrderChanged] = useState(false)
  const fileInputRef = useRef(null)
  const isManga = comic?.format === 'manga'

  const load = useCallback(() => {
    comicsApi.getBySlug(slug)
      .then(data => { setComic(data); setPages(data.pages || []); setCurrent(0) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (managing) return
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

  // ── Upload multiple files with progress ──
  const handleUpload = async (files) => {
    if (!files?.length) return
    const arr = Array.from(files)
    setUploadProgress({ done: 0, total: arr.length })
    try {
      let updated = [...pages]
      for (let i = 0; i < arr.length; i++) {
        const page = await comicsApi.addPage(comic.id, arr[i])
        updated = [...updated, page]
        setUploadProgress({ done: i + 1, total: arr.length })
      }
      const sorted = updated.sort((a, b) => a.page_number - b.page_number)
      setPages(sorted)
      setCurrent(sorted.length - 1)
    } catch (e) {
      alert(e.message)
    } finally {
      setUploadProgress(null)
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
    } catch (e) { alert(e.message) }
  }

  // ── Drag & drop reorder ──
  const onDragStart = (i) => setDragIdx(i)
  const onDragOver = (e, i) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === i) return
    const reordered = [...pages]
    const [moved] = reordered.splice(dragIdx, 1)
    reordered.splice(i, 0, moved)
    setPages(reordered)
    setDragIdx(i)
    setOrderChanged(true)
  }
  const onDragEnd = () => setDragIdx(null)

  const saveOrder = async () => {
    setSavingOrder(true)
    try {
      await comicsApi.reorderPages(comic.id, pages.map(p => p.id))
      const updated = pages.map((p, i) => ({ ...p, page_number: i + 1 }))
      setPages(updated)
      setOrderChanged(false)
    } catch (e) { alert(e.message) }
    finally { setSavingOrder(false) }
  }

  if (loading) return <div className={styles.state}>cargando…</div>
  if (error)   return <div className={`${styles.state} ${styles.error}`}>{error}</div>
  if (!comic)  return null

  const page = pages[current]
  const total = pages.length
  const isUploading = uploadProgress !== null

  return (
    <div className={`${styles.reader} ${isManga ? styles.mangaMode : ''}`}>

      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <Link to="/comics" className={styles.back}>← cómics</Link>
        <div className={styles.comicMeta}>
          <span className={styles.comicName}>{comic.title}</span>
          <span className={`${styles.formatTag} ${isManga ? styles.manga : styles.normal}`}>{comic.format}</span>
        </div>
        <div className={styles.topRight}>
          {/* Strip mode toggle */}
          <button
            className={`${styles.modeBtn} ${readerMode === 'strip' ? styles.active : ''}`}
            onClick={() => { setReaderMode(m => m === 'strip' ? 'single' : 'strip'); setManaging(false) }}
            title="Modo tira: ver todas las páginas en scroll continuo"
          >
            <Rows3 size={15} />
            <span className={styles.modeBtnLabel}>tira</span>
          </button>

          {canEdit && (
            <>
              {/* Manage pages toggle */}
              <button
                className={`${styles.modeBtn} ${managing ? styles.active : ''}`}
                onClick={() => { setManaging(m => !m); setReaderMode('single') }}
                title="Gestionar y reordenar páginas"
              >
                <GripVertical size={15} />
                <span className={styles.modeBtnLabel}>ordenar</span>
              </button>

              {/* Upload */}
              <button
                className={styles.uploadBtn}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload size={14} />
                <span>
                  {isUploading
                    ? `${uploadProgress.done}/${uploadProgress.total}`
                    : 'subir páginas'}
                </span>
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

      {/* ── Upload progress bar ── */}
      {isUploading && (
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }}
          />
          <span className={styles.progressLabel}>
            subiendo página {uploadProgress.done + 1} de {uploadProgress.total}…
          </span>
        </div>
      )}

      {total === 0 && !isUploading ? (
        <div className={styles.empty}>
          {canEdit ? 'Sube páginas con el botón "subir páginas"' : 'Este cómic no tiene páginas aún.'}
        </div>

      ) : managing ? (
        /* ── Manage / reorder panel ── */
        <div className={styles.managePanel}>
          <div className={styles.manageHeader}>
            <span className={styles.manageTitle}>gestionar páginas — arrastra para reordenar</span>
            {orderChanged && (
              <button className={styles.saveOrderBtn} onClick={saveOrder} disabled={savingOrder}>
                {savingOrder ? 'guardando…' : 'guardar orden'}
              </button>
            )}
          </div>
          <div className={styles.manageGrid}>
            {pages.map((p, i) => (
              <div
                key={p.id}
                className={`${styles.manageCard} ${dragIdx === i ? styles.dragging : ''}`}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={e => onDragOver(e, i)}
                onDragEnd={onDragEnd}
              >
                <div className={styles.dragHandle}>
                  <GripVertical size={14} />
                </div>
                <img src={p.image_url} alt={`pág ${i + 1}`} className={styles.manageThumb} />
                <span className={styles.manageNum}>{i + 1}</span>
                <button
                  className={styles.deleteManageBtn}
                  onClick={() => handleDeletePage(p.id)}
                  title="Eliminar"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

      ) : readerMode === 'strip' ? (
        /* ── Strip / scroll mode ── */
        <div className={`${styles.strip} ${isManga ? styles.stripManga : ''}`}>
          {pages.map(p => (
            <div key={p.id} className={styles.stripPage}>
              <img src={p.image_url} alt={`Página ${p.page_number}`} className={styles.stripImg} />
              {canEdit && (
                <button className={styles.deletePageBtn} onClick={() => handleDeletePage(p.id)} title="Eliminar página">
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

      ) : (
        /* ── Single page mode ── */
        <div className={styles.viewer}>
          <div className={`${styles.navZone} ${styles.navLeft}`}  onClick={isManga ? next : prev} />
          <div className={`${styles.navZone} ${styles.navRight}`} onClick={isManga ? prev : next} />

          {page && (
            <div className={styles.pageWrap}>
              <img key={page.id} src={page.image_url} alt={`Página ${page.page_number}`} className={styles.pageImg} />
              {canEdit && (
                <button className={styles.deleteCurrentBtn} onClick={() => handleDeletePage(page.id)} title="Eliminar esta página">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}

          <div className={styles.controls}>
            <button className={styles.navBtn} onClick={isManga ? next : prev} disabled={isManga ? current >= total - 1 : current <= 0}>‹</button>
            <span className={styles.pageCount}>{isManga ? `${total - current} / ${total}` : `${current + 1} / ${total}`}</span>
            <button className={styles.navBtn} onClick={isManga ? prev : next} disabled={isManga ? current <= 0 : current >= total - 1}>›</button>
          </div>

          {total > 1 && (
            <div className={`${styles.thumbs} ${isManga ? styles.thumbsManga : ''}`}>
              {pages.map((p, i) => (
                <button key={p.id} className={`${styles.thumb} ${i === current ? styles.thumbActive : ''}`} onClick={() => setCurrent(i)}>
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
