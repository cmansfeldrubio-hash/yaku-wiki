import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEntityBySlug } from '../hooks/useEntityBySlug'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { getTermBySlug, deleteTerm } from '../api/glossary'
import Modal from '../components/ui/Modal'
import GlossaryForm from '../components/glossary/GlossaryForm'
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal'
import RichText from '../components/wiki/RichText'
import styles from './EntityDetailPage.module.css'

export default function GlossaryTermPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { item: term, loading, error, retry } = useEntityBySlug(getTermBySlug, slug, 'Concepto')
  const { canEdit } = useAuth()

  const [modal, setModal] = useState(null) // 'edit' | 'delete'

  const closeModal = () => setModal(null)

  const handleDeleteConfirm = async () => {
    try {
      await deleteTerm(term.id)
      closeModal()
      showToast(`${term.name} eliminado`, 'success')
      navigate('/la-palabra')
    } catch (e) {
      showToast(e.message || 'Error eliminando concepto', 'error')
    }
  }

  const handleEditSuccess = () => {
    closeModal()
    showToast('Concepto actualizado', 'success')
    retry()
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>cargando concepto...</div>
      </div>
    )
  }

  if (error && error.includes('no encontrad')) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p className={styles.errorMsg}>Concepto no encontrado</p>
          <Link to="/la-palabra" className={styles.backLink}>← volver a la palabra</Link>
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

  if (!term) return null

  return (
    <div className={styles.page}>
      <Link to="/la-palabra" className={styles.breadcrumb}>
        <span className={styles.breadcrumbArrow}>←</span>
        <span>volver a la palabra</span>
      </Link>

      <div className={styles.layout}>
        <article className={styles.article}>
          {term.image_url ? (
            <img
              src={term.image_url}
              alt={term.name}
              className={styles.heroImage}
              onError={(e) => { e.target.style.display = 'none' }}
            />
          ) : (
            <div className={styles.heroFallback}>§</div>
          )}

          <div className={styles.content}>
            <div className={styles.headerRow}>
              <div className={styles.titleBlock}>
                <h1 className={styles.name}>{term.name}</h1>
              </div>

              {canEdit && (
                <div className={styles.actions}>
                  <button className={styles.btnEdit} onClick={() => setModal('edit')}>editar</button>
                  <button className={styles.btnDelete} onClick={() => setModal('delete')}>eliminar</button>
                </div>
              )}
            </div>

            <div className={styles.sections}>
              {term.description && (
                <div className={styles.section}>
                  <div className={styles.sectionLabel}>descripción</div>
                  <RichText text={term.description} excludeSlug={term.slug} className={styles.sectionText} />
                </div>
              )}

              {term.tags?.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionLabel}>tags</div>
                  <div className={styles.tags}>
                    {term.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.dates}>
              creado {new Date(term.created_at).toLocaleDateString('es-CL')} · actualizado {new Date(term.updated_at).toLocaleDateString('es-CL')}
            </div>
          </div>
        </article>
      </div>

      <Modal isOpen={modal === 'edit'} onClose={closeModal} title={`Editar — ${term.name}`}>
        <GlossaryForm term={term} onSuccess={handleEditSuccess} onCancel={closeModal} showToast={showToast} />
      </Modal>

      {modal === 'delete' && (
        <DeleteConfirmModal
          characterName={term.name}
          onConfirm={handleDeleteConfirm}
          onCancel={closeModal}
        />
      )}
    </div>
  )
}
