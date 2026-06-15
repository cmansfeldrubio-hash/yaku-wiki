import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEntityBySlug } from '../hooks/useEntityBySlug'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { getYakumeadaBySlug, deleteYakumeada } from '../api/yakumeadas'
import Modal from '../components/ui/Modal'
import YakumeadaForm from '../components/yakumeada/YakumeadaForm'
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal'
import RichText from '../components/wiki/RichText'
import styles from './EntityDetailPage.module.css'

export default function YakumeadaPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { item: yakumeada, loading, error, retry } = useEntityBySlug(getYakumeadaBySlug, slug, 'Yakumeada')
  const { canEdit } = useAuth()

  const [modal, setModal] = useState(null) // 'edit' | 'delete'
  const closeModal = () => setModal(null)

  const handleDeleteConfirm = async () => {
    try {
      await deleteYakumeada(yakumeada.id)
      closeModal()
      showToast(`${yakumeada.name} eliminada`, 'success')
      navigate('/yakumeadas')
    } catch (e) {
      showToast(e.message || 'Error eliminando yakumeada', 'error')
    }
  }

  const handleEditSuccess = () => {
    closeModal()
    showToast('Yakumeada actualizada', 'success')
    retry()
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>cargando yakumeada...</div>
      </div>
    )
  }

  if (error && error.includes('no encontrad')) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p className={styles.errorMsg}>Yakumeada no encontrada</p>
          <Link to="/yakumeadas" className={styles.backLink}>← volver a las yakumeadas</Link>
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

  if (!yakumeada) return null

  return (
    <div className={styles.page}>
      <Link to="/yakumeadas" className={styles.breadcrumb}>
        <span className={styles.breadcrumbArrow}>←</span>
        <span>volver a las yakumeadas</span>
      </Link>

      <div className={styles.layout}>
        <article className={styles.article} style={{ gridColumn: '1 / -1' }}>
          {yakumeada.image_url ? (
            <img
              src={yakumeada.image_url}
              alt={yakumeada.name}
              className={styles.heroImage}
              onError={(e) => { e.target.style.display = 'none' }}
            />
          ) : (
            <div className={styles.heroFallback}>✦</div>
          )}

          <div className={styles.content}>
            <div className={styles.headerRow}>
              <div className={styles.titleBlock}>
                <h1 className={styles.name}>{yakumeada.name}</h1>
                {yakumeada.excerpt && (
                  <div className={styles.subtitle}>{yakumeada.excerpt}</div>
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
              {yakumeada.content && (
                <div className={styles.section}>
                  <RichText text={yakumeada.content} excludeSlug={yakumeada.slug} as="div" className={styles.sectionText} />
                </div>
              )}

              {yakumeada.tags?.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionLabel}>tags</div>
                  <div className={styles.tags}>
                    {yakumeada.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.dates}>
              publicada {new Date(yakumeada.created_at).toLocaleDateString('es-CL')} · actualizada {new Date(yakumeada.updated_at).toLocaleDateString('es-CL')}
            </div>
          </div>
        </article>
      </div>

      <Modal isOpen={modal === 'edit'} onClose={closeModal} title={`Editar — ${yakumeada.name}`}>
        <YakumeadaForm yakumeada={yakumeada} onSuccess={handleEditSuccess} onCancel={closeModal} showToast={showToast} />
      </Modal>

      {modal === 'delete' && (
        <DeleteConfirmModal
          characterName={yakumeada.name}
          onConfirm={handleDeleteConfirm}
          onCancel={closeModal}
        />
      )}
    </div>
  )
}
