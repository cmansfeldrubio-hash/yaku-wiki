import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import { useEntityList } from '../hooks/useEntityList'
import { getGames, deleteGame } from '../api/games'
import GameForm from '../components/game/GameForm'
import Modal from '../components/ui/Modal'
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal'
import pageStyles from './EntityListPage.module.css'
import styles from './GamesPage.module.css'

export default function GamesPage() {
  const { showToast } = useToast()
  const { canEdit } = useAuth()
  const { items: games, total, loading, error, reload } = useEntityList(getGames)

  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)

  const closeModal = () => { setModal(null); setSelected(null) }
  const onEdit = (e, item) => { e.preventDefault(); e.stopPropagation(); setSelected(item); setModal('edit') }
  const onDelete = (e, item) => { e.preventDefault(); e.stopPropagation(); setSelected(item); setModal('delete') }

  const handleFormSuccess = async () => {
    const action = modal === 'create' ? 'Juego creado' : 'Juego actualizado'
    closeModal()
    await reload()
    showToast(action, 'success')
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteGame(selected.id)
      closeModal()
      await reload()
      showToast(`${selected.name} eliminado`, 'success')
    } catch (e) {
      showToast(e.message || 'Error eliminando', 'error')
    }
  }

  return (
    <div className={pageStyles.page}>
      <Link to="/" className={pageStyles.breadcrumb}>
        <span className={pageStyles.breadcrumbArrow}>←</span>
        <span>volver a la wiki</span>
      </Link>

      <div className={pageStyles.header}>
        <div>
          <h1 className={pageStyles.title}>yaku games</h1>
          <span className={pageStyles.count}>{total} juegos</span>
        </div>
        {canEdit && <button className={pageStyles.newBtn} onClick={() => setModal('create')}>+ nuevo juego</button>}
      </div>

      {loading && <p className={styles.status}>Cargando...</p>}
      {error && <p className={styles.status}>{error}</p>}

      {!loading && !error && games.length === 0 && (
        <p className={styles.status}>No hay juegos todavía.</p>
      )}

      <div className={styles.grid}>
        {games.map(game => (
          <a
            key={game.id}
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
          >
            <div className={styles.imageWrap}>
              {game.image_url
                ? <img src={game.image_url} alt={game.name} className={styles.image} />
                : <div className={styles.placeholder}>🎮</div>
              }
            </div>
            <div className={styles.info}>
              <div className={styles.name}>
                {game.name}
                <ExternalLink size={13} className={styles.linkIcon} />
              </div>
              {game.description && <p className={styles.desc}>{game.description}</p>}
            </div>
            {canEdit && (
              <div className={styles.actions}>
                <button className={styles.actionBtn} onClick={(e) => onEdit(e, game)} title="Editar">
                  <Pencil size={14} />
                </button>
                <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={(e) => onDelete(e, game)} title="Eliminar">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </a>
        ))}
      </div>

      <Modal isOpen={modal === 'create'} onClose={closeModal} title="Nuevo juego">
        <GameForm game={null} onSuccess={handleFormSuccess} onCancel={closeModal} showToast={showToast} />
      </Modal>

      <Modal isOpen={modal === 'edit'} onClose={closeModal} title={selected ? `Editar — ${selected.name}` : ''}>
        <GameForm game={selected} onSuccess={handleFormSuccess} onCancel={closeModal} showToast={showToast} />
      </Modal>

      {modal === 'delete' && selected && (
        <DeleteConfirmModal
          characterName={selected.name}
          onConfirm={handleDeleteConfirm}
          onCancel={closeModal}
        />
      )}
    </div>
  )
}
