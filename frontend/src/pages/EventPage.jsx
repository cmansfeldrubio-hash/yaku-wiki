import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEntityBySlug } from '../hooks/useEntityBySlug'
import { useAuth } from '../hooks/useAuth'
import { useEntityList } from '../hooks/useEntityList'
import { usePhotos } from '../hooks/usePhotos'
import { useToast } from '../hooks/useToast'
import { getEventBySlug, deleteEvent } from '../api/events'
import { getLocations } from '../api/locations'
import Modal from '../components/ui/Modal'
import EventForm from '../components/event/EventForm'
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal'
import styles from './EntityDetailPage.module.css'

export default function EventPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { item: event, loading, error, retry } = useEntityBySlug(getEventBySlug, slug, 'Evento')
  const { canEdit } = useAuth()
  const { photos: galleryPhotos } = usePhotos({ eventId: event?.id })
  const { items: locations } = useEntityList(getLocations)
  const location = locations.find(l => l.id === event?.location_id)

  const [modal, setModal] = useState(null) // 'edit' | 'delete'
  const [previewPhoto, setPreviewPhoto] = useState(null)

  const closeModal = () => setModal(null)

  const handleDeleteConfirm = async () => {
    try {
      await deleteEvent(event.id)
      closeModal()
      showToast(`${event.name} eliminado`, 'success')
      navigate('/eventos')
    } catch (e) {
      showToast(e.message || 'Error eliminando evento', 'error')
    }
  }

  const handleEditSuccess = () => {
    closeModal()
    showToast('Evento actualizado', 'success')
    retry()
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>cargando evento...</div>
      </div>
    )
  }

  if (error && error.includes('no encontrado')) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p className={styles.errorMsg}>Evento no encontrado</p>
          <Link to="/eventos" className={styles.backLink}>← volver a eventos</Link>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p className={styles.errorMsg}>{error}</p>
          <button className={styles.retryBtn} onClick={retry}>Reintentar</button>
        </div>
      </div>
    )
  }

  if (!event) return null

  return (
    <div className={styles.page}>
      <Link to="/eventos" className={styles.breadcrumb}>
        <span className={styles.breadcrumbArrow}>←</span>
        <span>volver a eventos</span>
      </Link>

      <div className={styles.layout}>
        <article className={styles.article}>
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.name}
              className={styles.heroImage}
              onError={(e) => { e.target.style.display = 'none' }}
            />
          ) : (
            <div className={styles.heroFallback}>◆</div>
          )}

          <div className={styles.content}>
            <div className={styles.headerRow}>
              <div className={styles.titleBlock}>
                <h1 className={styles.name}>{event.name}</h1>
                {(event.date || location) && (
                  <div className={styles.subtitle}>
                    {[event.date, location?.name].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>

              {canEdit && (
                <div className={styles.actions}>
                  <button className={styles.btnEdit} onClick={() => setModal('edit')}>editar</button>
                  <button className={styles.btnDelete} onClick={() => setModal('delete')}>eliminar</button>
                </div>
              )}
            </div>

            <div className={styles.sections}>
              {event.description && (
                <div className={styles.section}>
                  <div className={styles.sectionLabel}>descripción</div>
                  <p className={styles.sectionText}>{event.description}</p>
                </div>
              )}

              {location && (
                <div className={styles.section}>
                  <div className={styles.sectionLabel}>ubicación</div>
                  <p className={styles.sectionText}>
                    <Link to={`/ubicacion/${location.slug}`} className={styles.backLink}>{location.name}</Link>
                  </p>
                </div>
              )}

              {event.tags?.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionLabel}>tags</div>
                  <div className={styles.tags}>
                    {event.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.dates}>
              creado {new Date(event.created_at).toLocaleDateString('es-CL')} · actualizado {new Date(event.updated_at).toLocaleDateString('es-CL')}
            </div>
          </div>
        </article>

        <aside className={styles.gallery}>
          <div className={styles.galleryTitle}>galería</div>
          {galleryPhotos.length === 0 ? (
            <p className={styles.galleryEmpty}>sin fotos asociadas</p>
          ) : (
            <div className={styles.galleryGrid}>
              {galleryPhotos.map(photo => (
                <button
                  key={photo.id}
                  type="button"
                  className={styles.galleryThumb}
                  title={photo.caption || ''}
                  onClick={() => setPreviewPhoto(photo)}
                >
                  <img src={photo.url} alt={photo.caption || event.name} />
                </button>
              ))}
            </div>
          )}
          <Link to="/galeria" className={styles.galleryLink}>ver galería completa →</Link>
        </aside>
      </div>

      <Modal isOpen={!!previewPhoto} onClose={() => setPreviewPhoto(null)} maxWidth="720px">
        {previewPhoto && (
          <>
            <img src={previewPhoto.url} alt={previewPhoto.caption || event.name} className={styles.previewImg} />
            {previewPhoto.caption && <p className={styles.previewCaption}>{previewPhoto.caption}</p>}
          </>
        )}
      </Modal>

      <Modal isOpen={modal === 'edit'} onClose={closeModal} title={`Editar — ${event.name}`}>
        <EventForm event={event} onSuccess={handleEditSuccess} onCancel={closeModal} showToast={showToast} />
      </Modal>

      {modal === 'delete' && (
        <DeleteConfirmModal
          characterName={event.name}
          onConfirm={handleDeleteConfirm}
          onCancel={closeModal}
        />
      )}
    </div>
  )
}
