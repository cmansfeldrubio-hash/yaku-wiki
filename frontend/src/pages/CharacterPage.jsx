import { useState } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useCharacterBySlug } from '../hooks/useCharacterBySlug'
import { useAuth } from '../hooks/useAuth'
import { usePhotos } from '../hooks/usePhotos'
import { useToast } from '../hooks/useToast'
import { deleteCharacter } from '../api/characters'
import { getFactionColor, getFactionBg, FACTION_COLORS } from '../constants/factions'
import Avatar from '../components/ui/Avatar'
import StatusBadge from '../components/ui/StatusBadge'
import Modal from '../components/ui/Modal'
import CharacterForm from '../components/character/CharacterForm'
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal'
import styles from './CharacterPage.module.css'

export default function CharacterPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()
  const { character, loading, error, retry } = useCharacterBySlug(slug)
  const { canEdit } = useAuth()
  const { photos: galleryPhotos } = usePhotos({ characterId: character?.id })

  const [modal, setModal] = useState(null) // 'edit' | 'delete'
  const [previewPhoto, setPreviewPhoto] = useState(null)

  const closeModal = () => setModal(null)

  // Build back link preserving faction param
  const factionParam = searchParams.get('faction')
  const backTo = factionParam ? `/?faction=${encodeURIComponent(factionParam)}` : '/'

  // Handle delete
  const handleDeleteConfirm = async () => {
    try {
      await deleteCharacter(character.id)
      closeModal()
      showToast(`${character.name} eliminado`, 'success')
      navigate('/')
    } catch (e) {
      showToast(e.message || 'Error eliminando personaje', 'error')
    }
  }

  // Handle edit success
  const handleEditSuccess = () => {
    closeModal()
    showToast('Personaje actualizado', 'success')
    retry() // reload character data
  }

  // Loading state
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>cargando personaje...</div>
      </div>
    )
  }

  // 404 error
  if (error && error.includes('no encontrado')) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p className={styles.errorMsg}>Personaje no encontrado</p>
          <Link to="/" className={styles.backLink}>← volver a la wiki</Link>
        </div>
      </div>
    )
  }

  // Network/other error
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

  if (!character) return null

  const accentColor = getFactionColor(character.faction)
  const accentBg = getFactionBg(character.faction)
  const factionLabel = FACTION_COLORS[character.faction]?.label || character.faction

  // Build table of contents from fixed sections (with content) + custom sections
  const tocItems = [
    character.description && { id: 'descripcion', label: 'descripción' },
    character.hito && { id: 'hito-yakuma', label: 'hito yakuma' },
    character.poder && { id: 'poder-capacidad', label: 'poder / capacidad' },
    character.tags?.length > 0 && { id: 'tags', label: 'tags' },
    ...(character.sections || []).map(s => ({ id: s.id, label: s.title })),
  ].filter(Boolean)

  const scrollToSection = (e, id) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.page}>
      <Link to={backTo} className={styles.breadcrumb}>
        <span className={styles.breadcrumbArrow}>←</span>
        <span>volver a la wiki</span>
      </Link>

      <div className={styles.layout}>
      <article className={styles.article} style={{ borderTop: `3px solid ${accentColor}` }}>
        {/* Hero image */}
        {character.image_url ? (
          <img
            src={character.image_url}
            alt={character.name}
            className={styles.heroImage}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className={styles.heroFallback}>
            <Avatar name={character.name} faction={character.faction} size={80} fontSize={28} />
          </div>
        )}

        <div className={styles.content}>
          {/* Header with name + actions */}
          <div className={styles.headerRow}>
            <div className={styles.titleBlock}>
              <h1 className={styles.name}>{character.name}</h1>
              {character.aliases?.length > 0 && <div className={styles.alias}>también conocido como: {character.aliases.join(', ')}</div>}
              {character.origin && <div className={styles.origin}>{character.origin}</div>}
              <div className={styles.badges}>
                <span
                  className={styles.factionBadge}
                  style={{ background: accentBg, color: accentColor, border: `1px solid ${accentColor}33` }}
                >
                  {factionLabel}
                </span>
                <StatusBadge status={character.status} yakuma_title={character.yakuma_title} />
              </div>
            </div>

            {canEdit && (
              <div className={styles.actions}>
                <button className={styles.btnEdit} onClick={() => setModal('edit')}>editar</button>
                <button className={styles.btnDelete} onClick={() => setModal('delete')}>eliminar</button>
              </div>
            )}
          </div>

          {/* Table of contents */}
          {tocItems.length > 1 && (
            <nav className={styles.toc}>
              <div className={styles.tocTitle}>contenidos</div>
              <ol className={styles.tocList}>
                {tocItems.map(item => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} onClick={e => scrollToSection(e, item.id)}>{item.label}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Content sections */}
          <div className={styles.sections}>
            {character.description && (
              <div id="descripcion" className={styles.section}>
                <div className={styles.sectionLabel}>descripción</div>
                <p className={styles.sectionText}>{character.description}</p>
              </div>
            )}

            {character.hito && (
              <div id="hito-yakuma" className={styles.section}>
                <div className={styles.sectionLabel}>hito yakuma</div>
                <p className={styles.sectionText}>{character.hito}</p>
              </div>
            )}

            {character.poder && (
              <div id="poder-capacidad" className={styles.section}>
                <div className={styles.sectionLabel}>poder / capacidad</div>
                <p className={styles.sectionText}>{character.poder}</p>
              </div>
            )}

            {character.tags?.length > 0 && (
              <div id="tags" className={styles.section}>
                <div className={styles.sectionLabel}>tags</div>
                <div className={styles.tags}>
                  {character.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
                </div>
              </div>
            )}

            {(character.sections || []).map(section => (
              <div key={section.id} id={section.id} className={styles.section}>
                <div className={styles.sectionLabel}>{section.title}</div>
                <p className={styles.sectionText}>{section.content}</p>
              </div>
            ))}
          </div>

          {/* Dates */}
          <div className={styles.dates}>
            creado {new Date(character.created_at).toLocaleDateString('es-CL')} · actualizado {new Date(character.updated_at).toLocaleDateString('es-CL')}
          </div>
        </div>
      </article>

      {/* Photo gallery */}
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
                <img src={photo.url} alt={photo.caption || character.name} />
              </button>
            ))}
          </div>
        )}
        <Link to="/galeria" className={styles.galleryLink}>ver galería completa →</Link>
      </aside>
      </div>

      {/* Photo preview modal */}
      <Modal isOpen={!!previewPhoto} onClose={() => setPreviewPhoto(null)} maxWidth="720px">
        {previewPhoto && (
          <>
            <img src={previewPhoto.url} alt={previewPhoto.caption || character.name} className={styles.previewImg} />
            {previewPhoto.caption && <p className={styles.previewCaption}>{previewPhoto.caption}</p>}
          </>
        )}
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={modal === 'edit'} onClose={closeModal} title={`Editar — ${character.name}`}>
        <CharacterForm
          character={character}
          onSuccess={handleEditSuccess}
          onCancel={closeModal}
          showToast={showToast}
        />
      </Modal>

      {/* Delete confirm modal */}
      {modal === 'delete' && (
        <DeleteConfirmModal
          characterName={character.name}
          onConfirm={handleDeleteConfirm}
          onCancel={closeModal}
        />
      )}
    </div>
  )
}
