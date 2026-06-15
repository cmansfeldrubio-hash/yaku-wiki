import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import { useEntityList } from '../hooks/useEntityList'
import { getYakumeadas, deleteYakumeada } from '../api/yakumeadas'
import SearchInput from '../components/ui/SearchInput'
import EntityGrid from '../components/ui/EntityGrid'
import YakumeadaForm from '../components/yakumeada/YakumeadaForm'
import Modal from '../components/ui/Modal'
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal'
import styles from './EntityListPage.module.css'

export default function YakumeadasPage() {
  const { showToast } = useToast()
  const { canEdit } = useAuth()
  const [search, setSearch] = useState('')
  const handleSearch = useCallback((val) => setSearch(val), [])

  const { items: yakumeadas, total, loading, error, reload } = useEntityList(getYakumeadas, search)

  const [modal, setModal] = useState(null) // 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null)

  const closeModal = () => { setModal(null); setSelected(null) }
  const onEdit = (item) => { setSelected(item); setModal('edit') }
  const onDelete = (item) => { setSelected(item); setModal('delete') }

  const handleFormSuccess = async () => {
    const action = modal === 'create' ? 'Yakumeada creada' : 'Yakumeada actualizada'
    closeModal()
    await reload()
    showToast(action, 'success')
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteYakumeada(selected.id)
      closeModal()
      await reload()
      showToast(`${selected.name} eliminada`, 'success')
    } catch (e) {
      showToast(e.message || 'Error eliminando', 'error')
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
          <h1 className={styles.title}>las últimas yakumeadas</h1>
          <span className={styles.count}>{total} yakumeadas</span>
        </div>
        {canEdit && <button className={styles.newBtn} onClick={() => setModal('create')}>+ nueva yakumeada</button>}
      </div>

      <div className={styles.search}>
        <SearchInput onChange={handleSearch} />
      </div>

      <EntityGrid
        items={yakumeadas}
        loading={loading}
        error={error}
        basePath="/yakumeada"
        icon="✦"
        getSubtitle={(item) => item.excerpt}
        onEdit={onEdit}
        onDelete={onDelete}
        emptyLabel="No hay yakumeadas todavía."
      />

      <Modal isOpen={modal === 'create'} onClose={closeModal} title="Nueva yakumeada">
        <YakumeadaForm yakumeada={null} onSuccess={handleFormSuccess} onCancel={closeModal} showToast={showToast} />
      </Modal>

      <Modal isOpen={modal === 'edit'} onClose={closeModal} title={selected ? `Editar — ${selected.name}` : ''}>
        <YakumeadaForm yakumeada={selected} onSuccess={handleFormSuccess} onCancel={closeModal} showToast={showToast} />
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
