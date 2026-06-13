import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEntityBySlug } from '../hooks/useEntityBySlug'
import { useAuth } from '../hooks/useAuth'
import { usePhotos } from '../hooks/usePhotos'
import { useToast } from '../hooks/useToast'
import { getLocationBySlug, deleteLocation } from '../api/locations'
import Modal from '../components/ui/Modal'
import LocationForm from '../components/location/LocationForm'
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal'
import RichText from '../components/wiki/RichText'
import styles from './EntityDetailPage.module.css'

export default function LocationPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { item: location, loading, error, retry } = useEntityBySlug(getLocationBySlug, slug, 'Ubicación')
  const { canEdit } = useAuth()
  const { photos: galleryPhotos } = usePhotos({ locationId: location?.id })

  const [modal, setModal] = useState(null) // 'edit' | 'delete'
  const [previewPhoto, setPreviewPhoto] = useState(null)

  const closeModal = () => setModal(null)

  const handleDeleteConfirm = async () => {
    try {
      await deleteLocation(location.id)
      closeModal()
      showToast(`${location.name} eliminada`, 'success')
      navigate('/ubicaciones')
    } catch (e) {
      showToast(e.message || 'Error eliminando ubicación', 'error')
    }
  }

  const handleEditSuccess = () => {
    closeModal()
    showToast('Ubicación actualizada', 'success')
    retry()
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>cargando ubicación...</div>
      </div>
    )
  }

  if (error && error.includes('no encontrad')) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p className={styles.errorMsg}>Ubicación no encontrada</p>
          <Link to="/ubicaciones" className={styles.backLink}>← volver a ubicaciones</Link>
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

  if (!location) return null

  return (
    <div className={styles.page}>
      <Link to="/ubicaciones" className={styles.breadcrumb}>
        <span className={styles.breadcrumbArrow}>←</span>
        <span>volver a ubicaciones</span>
      </Link>

      <div className={styles.layout}>
        <article className={styles.article}>
          {location.image_url ? (
            <img
              src={location.image_url}
              alt={location.name}
              className={styles.heroImage}
              onError={(e) => { e.target.style.display = 'none' }}
            />
          ) : (
            <div className={styles.heroFallback}>◇</div>
          )}

          <div className={styles.content}>
            <div className={styles.headerRow}>
              <div className={styles.titleBlock}>
                <h1 className={styles.name}>{location.name}</h1>
                {location.type && <div className={styles.subtitle}>{location.type}</div>}
              </div>

              {canEdit && (
                <div className={styles.actions}>
                  <button className={styles.btnEdit} onClick={() => setModal('edit')}>editar</button>
                  <button className={styles.btnDelete} onClick={() => setModal('delete')}>eliminar</button>
                </div>
              )}
            </div>

            <div className={styles.sections}>
              {location.description && (
                <div className={styles.section}>
                  <div className={styles.sectionLabel}>descripción</div>
                  <RichText text={location.description} excludeSlug={location.slug} className={styles.sectionText} />
                </div>
              )}

              {location.tags?.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionLabel}>tags</div>
                  <div className={styles.tags}>
                    {location.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.dates}>
              creado {new Date(location.created_at).toLocaleDateString('es-CL')} · actualizado {new Date(location.updated_at).toLocaleDateString('es-CL')}
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
                  <img src={photo.url} alt={photo.caption || location.name} />
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
            <img src={previewPhoto.url} alt={previewPhoto.caption || location.name} className={styles.previewImg} />
            {previewPhoto.caption && <p className={styles.previewCaption}>{previewPhoto.caption}</p>}
          </>
        )}
      </Modal>

      <Modal isOpen={modal === 'edit'} onClose={closeModal} title={`Editar — ${location.name}`}>
        <LocationForm location={location} onSuccess={handleEditSuccess} onCancel={closeModal} showToast={showToast} />
      </Modal>

      {modal === 'delete' && (
        <DeleteConfirmModal
          characterName={location.name}
          onConfirm={handleDeleteConfirm}
          onCancel={closeModal}
        />
      )}
    </div>
  )
}
