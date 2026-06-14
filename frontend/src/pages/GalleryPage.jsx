import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { usePhotos } from '../hooks/usePhotos'
import { useCharacters } from '../hooks/useCharacters'
import { useEntityList } from '../hooks/useEntityList'
import { getEvents } from '../api/events'
import { getLocations } from '../api/locations'
import { getTerms } from '../api/glossary'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import { uploadPhoto, updatePhoto, deletePhoto, createPhotoFromUrl } from '../api/photos'
import Modal from '../components/ui/Modal'
import CharacterTagPicker from '../components/character/CharacterTagPicker'
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal'
import styles from './GalleryPage.module.css'

export default function GalleryPage() {
  const { showToast } = useToast()
  const { canEdit } = useAuth()
  const { photos, total, loading, error, reload } = usePhotos()
  const { characters } = useCharacters('', '')
  const { items: events } = useEntityList(getEvents)
  const { items: locations } = useEntityList(getLocations)
  const { items: terms } = useEntityList(getTerms)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [selected, setSelected] = useState(null) // photo being viewed/edited
  const [deleteTarget, setDeleteTarget] = useState(null)

  const charById = Object.fromEntries(characters.map(c => [c.id, c]))
  const eventById = Object.fromEntries(events.map(e => [e.id, e]))
  const locationById = Object.fromEntries(locations.map(l => [l.id, l]))

  const tagNames = (photo) => [
    ...(photo.character_ids || []).map(id => charById[id]?.name),
    ...(photo.event_ids || []).map(id => eventById[id]?.name),
    ...(photo.location_ids || []).map(id => locationById[id]?.name),
  ].filter(Boolean).join(', ')

  // Synthetic, read-only entries for images assigned directly to wiki entities
  // (character/location/event/glossary banners) so they also show up here.
  const entityPhotos = [
    ...characters.filter(c => c.image_url).map(c => ({
      id: `character-${c.id}`, url: c.image_url, caption: c.name, source: 'character', slug: c.slug,
    })),
    ...locations.filter(l => l.image_url).map(l => ({
      id: `location-${l.id}`, url: l.image_url, caption: l.name, source: 'location', slug: l.slug,
    })),
    ...events.filter(e => e.image_url).map(e => ({
      id: `event-${e.id}`, url: e.image_url, caption: e.name, source: 'event', slug: e.slug,
    })),
    ...terms.filter(t => t.image_url).map(t => ({
      id: `glossary-${t.id}`, url: t.image_url, caption: t.name, source: 'glossary', slug: t.slug,
    })),
  ]

  const allPhotos = [...photos, ...entityPhotos]

  const entityLink = (photo) => ({
    character: `/personaje/${photo.slug}`,
    location: `/ubicacion/${photo.slug}`,
    event: `/evento/${photo.slug}`,
    glossary: `/la-palabra/${photo.slug}`,
  })[photo.source]

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.breadcrumb}>
        <span className={styles.breadcrumbArrow}>←</span>
        <span>volver a la wiki</span>
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>galería</h1>
          <span className={styles.count}>{total + entityPhotos.length} fotos</span>
        </div>
        {canEdit && <button className={styles.uploadBtn} onClick={() => setUploadOpen(true)}>+ subir foto</button>}
      </div>

      {loading && <div className={styles.loading}>cargando galería...</div>}
      {error && <div className={styles.errorMsg}>{error}</div>}

      {!loading && !error && allPhotos.length === 0 && (
        <div className={styles.empty}>todavía no hay fotos en la galería</div>
      )}

      <div className={styles.grid}>
        {allPhotos.map(photo => (
          <button key={photo.id} className={styles.thumb} onClick={() => setSelected(photo)}>
            <img src={photo.url} alt={photo.caption || 'foto'} />
            {(tagNames(photo) || photo.caption) && (
              <div className={styles.thumbTags}>{tagNames(photo) || photo.caption}</div>
            )}
          </button>
        ))}
      </div>

      {/* Upload modal */}
      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Subir foto">
        <UploadForm
          characters={characters}
          events={events}
          locations={locations}
          showToast={showToast}
          onSuccess={async () => { setUploadOpen(false); await reload() }}
          onCancel={() => setUploadOpen(false)}
        />
      </Modal>

      {/* Detail / edit modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.source ? selected.caption : (canEdit ? 'Editar foto' : 'Foto')}>
        {selected && selected.source && (
          <EntityPhotoDetail
            photo={selected}
            link={entityLink(selected)}
            characters={characters}
            events={events}
            locations={locations}
            canEdit={canEdit}
            showToast={showToast}
            onSuccess={async () => { setSelected(null); await reload() }}
            onClose={() => setSelected(null)}
          />
        )}
        {selected && !selected.source && (
          <PhotoDetail
            photo={selected}
            characters={characters}
            events={events}
            locations={locations}
            tagNames={tagNames}
            canEdit={canEdit}
            showToast={showToast}
            onSuccess={async (updated) => { setSelected(updated); await reload() }}
            onDelete={() => setDeleteTarget(selected)}
            onClose={() => setSelected(null)}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirmModal
          characterName={deleteTarget.caption || 'esta foto'}
          onConfirm={async () => {
            try {
              await deletePhoto(deleteTarget.id)
              setDeleteTarget(null)
              setSelected(null)
              await reload()
              showToast('Foto eliminada', 'success')
            } catch (e) {
              showToast(e.message || 'Error eliminando la foto', 'error')
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
    if (!file) { showToast('Selecciona una imagen', 'error'); return }
    setSaving(true)
    try {
      await uploadPhoto({ file, caption, characterIds, eventIds, locationIds })
      onSuccess()
      showToast('Foto subida', 'success')
    } catch (e) {
      showToast(e.message || 'Error subiendo la foto', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className={styles.formGroup}>
        <label className={styles.label}>imagen</label>
        <div className={styles.imageArea} onClick={() => fileRef.current.click()}>
          {previewUrl
            ? <img src={previewUrl} alt="preview" className={styles.preview} />
            : <span className={styles.imagePlaceholder}>click para elegir una foto</span>
          }
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>descripción (opcional)</label>
        <input className={styles.input} value={caption} onChange={e => setCaption(e.target.value)} placeholder="dónde y cuándo fue tomada..." />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>personajes en la foto</label>
        <CharacterTagPicker characters={characters} selectedIds={characterIds} onToggle={toggle(setCharacterIds)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>eventos relacionados</label>
        <CharacterTagPicker characters={events} selectedIds={eventIds} onToggle={toggle(setEventIds)} placeholder="buscar evento..." />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>ubicaciones relacionadas</label>
        <CharacterTagPicker characters={locations} selectedIds={locationIds} onToggle={toggle(setLocationIds)} placeholder="buscar ubicación..." />
      </div>

      <div className={styles.footer}>
        <button className={styles.btnCancel} onClick={onCancel}>cancelar</button>
        <button className={styles.btnSave} onClick={handleSubmit} disabled={saving}>
          {saving ? 'subiendo...' : 'subir foto'}
        </button>
      </div>
    </>
  )
}

function PhotoDetail({ photo, characters, events, locations, tagNames, canEdit, showToast, onSuccess, onDelete, onClose }) {
  const [caption, setCaption] = useState(photo.caption || '')
  const [characterIds, setCharacterIds] = useState(photo.character_ids || [])
  const [eventIds, setEventIds] = useState(photo.event_ids || [])
  const [locationIds, setLocationIds] = useState(photo.location_ids || [])
  const [saving, setSaving] = useState(false)

  const toggle = (setter) => (id) => {
    setter(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updatePhoto(photo.id, {
        caption,
        character_ids: characterIds,
        event_ids: eventIds,
        location_ids: locationIds,
      })
      onSuccess(updated)
      showToast('Foto actualizada', 'success')
    } catch (e) {
      showToast(e.message || 'Error actualizando la foto', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!canEdit) {
    return (
      <>
        <img src={photo.url} alt={photo.caption || 'foto'} className={styles.detailImg} />
        {photo.caption && <p className={styles.previewCaption}>{photo.caption}</p>}
        {tagNames?.(photo) && <p className={styles.thumbTags}>{tagNames(photo)}</p>}
        <div className={styles.footer}>
          <div style={{ flex: 1 }} />
          <button className={styles.btnCancel} onClick={onClose}>cerrar</button>
        </div>
      </>
    )
  }

  return (
    <>
      <img src={photo.url} alt={photo.caption || 'foto'} className={styles.detailImg} />

      <div className={styles.formGroup}>
        <label className={styles.label}>descripción</label>
        <input className={styles.input} value={caption} onChange={e => setCaption(e.target.value)} placeholder="dónde y cuándo fue tomada..." />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>personajes en la foto</label>
        <CharacterTagPicker characters={characters} selectedIds={characterIds} onToggle={toggle(setCharacterIds)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>eventos relacionados</label>
        <CharacterTagPicker characters={events} selectedIds={eventIds} onToggle={toggle(setEventIds)} placeholder="buscar evento..." />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>ubicaciones relacionadas</label>
        <CharacterTagPicker characters={locations} selectedIds={locationIds} onToggle={toggle(setLocationIds)} placeholder="buscar ubicación..." />
      </div>

      <div className={styles.footer}>
        <button className={styles.btnDelete} onClick={onDelete}>eliminar foto</button>
        <div style={{ flex: 1 }} />
        <button className={styles.btnCancel} onClick={onClose}>cerrar</button>
        <button className={styles.btnSave} onClick={handleSave} disabled={saving}>
          {saving ? 'guardando...' : 'guardar'}
        </button>
      </div>
    </>
  )
}

// View for images that come from a character/location/event/glossary banner
// image rather than from the photos table. The image itself is edited on the
// entity's own page, but editors can add it to the gallery's photo catalog
// with its own caption and people/event/location tags.
function EntityPhotoDetail({ photo, link, characters, events, locations, canEdit, showToast, onSuccess, onClose }) {
  const [caption, setCaption] = useState(photo.caption || '')
  const [characterIds, setCharacterIds] = useState([])
  const [eventIds, setEventIds] = useState([])
  const [locationIds, setLocationIds] = useState([])
  const [saving, setSaving] = useState(false)

  const toggle = (setter) => (id) => {
    setter(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await createPhotoFromUrl({
        url: photo.url,
        caption,
        character_ids: characterIds,
        event_ids: eventIds,
        location_ids: locationIds,
      })
      showToast('Foto agregada a la galería con su etiquetado', 'success')
      onSuccess()
    } catch (e) {
      showToast(e.message || 'Error guardando el etiquetado', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!canEdit) {
    return (
      <>
        <img src={photo.url} alt={photo.caption || 'foto'} className={styles.detailImg} />
        {photo.caption && <p className={styles.previewCaption}>{photo.caption}</p>}
        <div className={styles.footer}>
          {link && <Link to={link} className={styles.galleryLink}>ver página →</Link>}
          <div style={{ flex: 1 }} />
          <button className={styles.btnCancel} onClick={onClose}>cerrar</button>
        </div>
      </>
    )
  }

  return (
    <>
      <img src={photo.url} alt={photo.caption || 'foto'} className={styles.detailImg} />

      <div className={styles.formGroup}>
        <label className={styles.label}>descripción</label>
        <input className={styles.input} value={caption} onChange={e => setCaption(e.target.value)} placeholder="dónde y cuándo fue tomada..." />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>personajes en la foto</label>
        <CharacterTagPicker characters={characters} selectedIds={characterIds} onToggle={toggle(setCharacterIds)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>eventos relacionados</label>
        <CharacterTagPicker characters={events} selectedIds={eventIds} onToggle={toggle(setEventIds)} placeholder="buscar evento..." />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>ubicaciones relacionadas</label>
        <CharacterTagPicker characters={locations} selectedIds={locationIds} onToggle={toggle(setLocationIds)} placeholder="buscar ubicación..." />
      </div>

      <div className={styles.footer}>
        {link && <Link to={link} className={styles.galleryLink}>ver página →</Link>}
        <div style={{ flex: 1 }} />
        <button className={styles.btnCancel} onClick={onClose}>cerrar</button>
        <button className={styles.btnSave} onClick={handleSave} disabled={saving}>
          {saving ? 'guardando...' : 'guardar etiquetado'}
        </button>
      </div>
    </>
  )
}
