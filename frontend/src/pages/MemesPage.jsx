import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useMemes } from '../hooks/useMemes'
import { useCharacters } from '../hooks/useCharacters'
import { useEntityList } from '../hooks/useEntityList'
import { getEvents } from '../api/events'
import { getLocations } from '../api/locations'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import { uploadMeme, toggleMemeLike, updateMeme, deleteMeme } from '../api/memes'
import Modal from '../components/ui/Modal'
import CharacterTagPicker from '../components/character/CharacterTagPicker'
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal'
import styles from './MemesPage.module.css'

const EDITOR_ROLES = ['editor', 'admin', 'owner']

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MemesPage() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const { memes, total, loading, error, reload, setMemes } = useMemes()
  const { characters } = useCharacters('', '')
  const { items: events } = useEntityList(getEvents)
  const { items: locations } = useEntityList(getLocations)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const charById = Object.fromEntries(characters.map(c => [c.id, c]))
  const eventById = Object.fromEntries(events.map(e => [e.id, e]))
  const locationById = Object.fromEntries(locations.map(l => [l.id, l]))

  const tagNames = (meme) => [
    ...(meme.character_ids || []).map(id => charById[id]?.name),
    ...(meme.event_ids || []).map(id => eventById[id]?.name),
    ...(meme.location_ids || []).map(id => locationById[id]?.name),
  ].filter(Boolean).join(', ')

  const handleLike = async (meme) => {
    if (!user) { showToast('Inicia sesión para dar like', 'error'); return }
    try {
      const updated = await toggleMemeLike(meme.id)
      setMemes(ms => ms.map(m => m.id === meme.id ? { ...m, ...updated } : m))
    } catch (e) {
      showToast(e.message || 'Error al dar like', 'error')
    }
  }

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.breadcrumb}>
        <span className={styles.breadcrumbArrow}>←</span>
        <span>volver a la wiki</span>
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>los memes</h1>
          <span className={styles.count}>{total} memes</span>
        </div>
        {user && <button className={styles.uploadBtn} onClick={() => setUploadOpen(true)}>+ subir meme</button>}
      </div>

      {loading && <div className={styles.loading}>cargando memes...</div>}
      {error && <div className={styles.errorMsg}>{error}</div>}

      {!loading && !error && memes.length === 0 && (
        <div className={styles.empty}>todavía no hay memes. ¡sé el primero en subir uno!</div>
      )}

      <div className={styles.feed}>
        {memes.map(meme => (
          <div key={meme.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.author}>{meme.uploaded_by_name || 'anónimo'}</span>
              <span className={styles.date}>{formatDate(meme.uploaded_at)}</span>
            </div>

            <button className={styles.imgBtn} onClick={() => setEditing(meme)}>
              <img src={meme.url} alt={meme.caption || 'meme'} className={styles.cardImg} />
            </button>

            {meme.caption && <p className={styles.caption}>{meme.caption}</p>}
            {tagNames(meme) && <p className={styles.tags}>{tagNames(meme)}</p>}

            <div className={styles.cardFooter}>
              <button
                className={`${styles.likeBtn} ${meme.liked_by_me ? styles.liked : ''}`}
                onClick={() => handleLike(meme)}
                disabled={!user}
              >
                {meme.liked_by_me ? '♥' : '♡'} {meme.likes_count}
              </button>
              <button className={styles.tagBtn} onClick={() => setEditing(meme)}>
                {user ? 'etiquetar' : 'ver etiquetas'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload modal */}
      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Subir meme">
        <UploadForm
          characters={characters}
          events={events}
          locations={locations}
          showToast={showToast}
          onSuccess={async () => { setUploadOpen(false); await reload() }}
          onCancel={() => setUploadOpen(false)}
        />
      </Modal>

      {/* Detail / tag modal */}
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Meme">
        {editing && (
          <MemeDetail
            meme={editing}
            characters={characters}
            events={events}
            locations={locations}
            tagNames={tagNames}
            user={user}
            showToast={showToast}
            onSuccess={async (updated) => { setEditing(updated); await reload() }}
            onDelete={() => setDeleteTarget(editing)}
            onClose={() => setEditing(null)}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirmModal
          characterName={deleteTarget.caption || 'este meme'}
          onConfirm={async () => {
            try {
              await deleteMeme(deleteTarget.id)
              setDeleteTarget(null)
              setEditing(null)
              await reload()
              showToast('Meme eliminado', 'success')
            } catch (e) {
              showToast(e.message || 'Error eliminando el meme', 'error')
            }
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

function UploadForm({ characters, events, locations, showToast, onSuccess, onCancel }) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [caption, setCaption] = useState('')
  const [characterIds, setCharacterIds] = useState([])
  const [eventIds, setEventIds] = useState([])
  const [locationIds, setLocationIds] = useState([])
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }

  const toggle = (setter) => (id) => {
    setter(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])
  }

  const handleSubmit = async () => {
    if (!file) { showToast('Selecciona una imagen o gif', 'error'); return }
    setSaving(true)
    try {
      await uploadMeme({ file, caption, characterIds, eventIds, locationIds })
      onSuccess()
      showToast('Meme subido', 'success')
    } catch (e) {
      showToast(e.message || 'Error subiendo el meme', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className={styles.formGroup}>
        <label className={styles.label}>imagen o gif</label>
        <div className={styles.imageArea} onClick={() => fileRef.current.click()}>
          {previewUrl
            ? <img src={previewUrl} alt="preview" className={styles.preview} />
            : <span className={styles.imagePlaceholder}>click para elegir una imagen o gif</span>
          }
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>descripción (opcional)</label>
        <input className={styles.input} value={caption} onChange={e => setCaption(e.target.value)} placeholder="de qué se trata este meme..." />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>personajes</label>
        <CharacterTagPicker characters={characters} selectedIds={characterIds} onToggle={toggle(setCharacterIds)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>eventos</label>
        <CharacterTagPicker characters={events} selectedIds={eventIds} onToggle={toggle(setEventIds)} placeholder="buscar evento..." />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>ubicaciones</label>
        <CharacterTagPicker characters={locations} selectedIds={locationIds} onToggle={toggle(setLocationIds)} placeholder="buscar ubicación..." />
      </div>

      <div className={styles.footer}>
        <button className={styles.btnCancel} onClick={onCancel}>cancelar</button>
        <button className={styles.btnSave} onClick={handleSubmit} disabled={saving}>
          {saving ? 'subiendo...' : 'subir meme'}
        </button>
      </div>
    </>
  )
}

function MemeDetail({ meme, characters, events, locations, tagNames, user, showToast, onSuccess, onDelete, onClose }) {
  const [caption, setCaption] = useState(meme.caption || '')
  const [characterIds, setCharacterIds] = useState(meme.character_ids || [])
  const [eventIds, setEventIds] = useState(meme.event_ids || [])
  const [locationIds, setLocationIds] = useState(meme.location_ids || [])
  const [saving, setSaving] = useState(false)

  const canEditCaption = !!user && (user.id === meme.uploaded_by || EDITOR_ROLES.includes(user.role))
  const canDelete = canEditCaption

  const toggle = (setter) => (id) => {
    setter(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const body = { character_ids: characterIds, event_ids: eventIds, location_ids: locationIds }
      if (canEditCaption) body.caption = caption
      const updated = await updateMeme(meme.id, body)
      onSuccess({ ...meme, ...updated })
      showToast('Etiquetado actualizado', 'success')
    } catch (e) {
      showToast(e.message || 'Error guardando el etiquetado', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <>
        <img src={meme.url} alt={meme.caption || 'meme'} className={styles.detailImg} />
        {meme.caption && <p className={styles.caption}>{meme.caption}</p>}
        {tagNames?.(meme) && <p className={styles.tags}>{tagNames(meme)}</p>}
        <div className={styles.footer}>
          <div style={{ flex: 1 }} />
          <button className={styles.btnCancel} onClick={onClose}>cerrar</button>
        </div>
      </>
    )
  }

  return (
    <>
      <img src={meme.url} alt={meme.caption || 'meme'} className={styles.detailImg} />

      <div className={styles.formGroup}>
        <label className={styles.label}>descripción{!canEditCaption && ' (solo el autor o un editor puede cambiarla)'}</label>
        <input
          className={styles.input}
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="de qué se trata este meme..."
          disabled={!canEditCaption}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>personajes</label>
        <CharacterTagPicker characters={characters} selectedIds={characterIds} onToggle={toggle(setCharacterIds)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>eventos</label>
        <CharacterTagPicker characters={events} selectedIds={eventIds} onToggle={toggle(setEventIds)} placeholder="buscar evento..." />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>ubicaciones</label>
        <CharacterTagPicker characters={locations} selectedIds={locationIds} onToggle={toggle(setLocationIds)} placeholder="buscar ubicación..." />
      </div>

      <div className={styles.footer}>
        {canDelete && <button className={styles.btnDelete} onClick={onDelete}>eliminar meme</button>}
        <div style={{ flex: 1 }} />
        <button className={styles.btnCancel} onClick={onClose}>cerrar</button>
        <button className={styles.btnSave} onClick={handleSave} disabled={saving}>
          {saving ? 'guardando...' : 'guardar etiquetado'}
        </button>
      </div>
    </>
  )
}
