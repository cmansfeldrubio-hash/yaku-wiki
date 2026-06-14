import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCards } from '../hooks/useCards'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { deleteCard } from '../api/cards'
import Modal from '../components/ui/Modal'
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal'
import { RARITY_OPTIONS } from '../utils/cardLayout'
import styles from './CardsGalleryPage.module.css'

const EDITOR_ROLES = ['editor', 'admin', 'owner']
const RARITY_LABELS = Object.fromEntries(RARITY_OPTIONS.map(o => [o.value, o.label]))
const CARD_TYPE_LABELS = { personaje: 'personaje', efecto: 'efecto' }

export default function CardsGalleryPage() {
  const { cards, total, loading, error, reload } = useCards()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [selected, setSelected] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const canDelete = (card) =>
    !!user && (user.id === card.created_by || EDITOR_ROLES.includes(user.role))

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.breadcrumb}>
        <span className={styles.breadcrumbArrow}>←</span>
        <span>volver a la wiki</span>
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>galería de cartas</h1>
          <span className={styles.count}>{total} cartas</span>
        </div>
        {user && <Link to="/cards/crear" className={styles.createBtn}>+ crear carta</Link>}
      </div>

      {loading && <div className={styles.loading}>cargando cartas...</div>}
      {error && <div className={styles.errorMsg}>{error}</div>}

      {!loading && !error && cards.length === 0 && (
        <div className={styles.empty}>
          todavía no hay cartas. ¡crea la primera!
        </div>
      )}

      <div className={styles.grid}>
        {cards.map(card => (
          <button key={card.id} className={styles.cardTile} onClick={() => setSelected(card)}>
            <img src={card.rendered_url} alt={card.name} className={styles.cardImg} />
            <div className={styles.cardInfo}>
              <span className={styles.cardName}>{card.name}</span>
              <span className={styles.cardMeta}>
                {RARITY_LABELS[card.rarity] || card.rarity} · {CARD_TYPE_LABELS[card.card_type] || card.card_type}
              </span>
            </div>
          </button>
        ))}
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name || 'Carta'} maxWidth="420px">
        {selected && (
          <>
            <img src={selected.rendered_url} alt={selected.name} className={styles.detailImg} />
            <p className={styles.detailMeta}>
              {RARITY_LABELS[selected.rarity] || selected.rarity} · {CARD_TYPE_LABELS[selected.card_type] || selected.card_type} · costo {selected.cost}
            </p>
            {selected.effect_text && <p className={styles.detailEffect}>{selected.effect_text}</p>}
            <div className={styles.detailFooter}>
              {canDelete(selected) && (
                <button className={styles.btnDelete} onClick={() => setDeleteTarget(selected)}>eliminar carta</button>
              )}
              <div style={{ flex: 1 }} />
              <button className={styles.btnCancel} onClick={() => setSelected(null)}>cerrar</button>
            </div>
          </>
        )}
      </Modal>

      {deleteTarget && (
        <DeleteConfirmModal
          characterName={deleteTarget.name || 'esta carta'}
          onConfirm={async () => {
            try {
              await deleteCard(deleteTarget.id)
              setDeleteTarget(null)
              setSelected(null)
              await reload()
              showToast('Carta eliminada', 'success')
            } catch (e) {
              showToast(e.message || 'Error eliminando la carta', 'error')
            }
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
