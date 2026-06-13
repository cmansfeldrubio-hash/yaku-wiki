import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import { useEntityList } from '../hooks/useEntityList'
import { getLocations, deleteLocation } from '../api/locations'
import SearchInput from '../components/ui/SearchInput'
import EntityGrid from '../components/ui/EntityGrid'
import LocationForm from '../components/location/LocationForm'
import Modal from '../components/ui/Modal'
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal'
import styles from './EntityListPage.module.css'

export default function LocationsPage() {
  const { showToast } = useToast()
  const { canEdit } = useAuth()
  const [search, setSearch] = useState('')
  const handleSearch = useCallback((val) => setSearch(val), [])

  const { items: locations, total, loading, error, reload } = useEntityList(getLocations, search)

  const [modal, setModal] = useState(null) // 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null)

  const closeModal = () => { setModal(null); setSelected(null) }
  const onEdit = (item) => { setSelected(item); setModal('edit') }
  const onDelete = (item) => { setSelected(item); setModal('delete') }

  const handleFormSuccess = async () => {
    const action = modal === 'create' ? 'Ubicación creada' : 'Ubicación actualizada'
    closeModal()
    await reload()
    showToast(action, 'success')
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteLocation(selected.id)
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
          <h1 className={styles.title}>ubicaciones</h1>
          <span className={styles.count}>{total} ubicaciones</span>
        </div>
        {canEdit && <button className={styles.newBtn} onClick={() => setModal('create')}>+ nueva ubicación</button>}
      </div>

      <div className={styles.search}>
        <SearchInput onChange={handleSearch} />
      </div>

      <EntityGrid
        items={locations}
        loading={loading}
        error={error}
        basePath="/ubicacion"
        icon="◇"
        getSubtitle={(item) => item.type}
        onEdit={onEdit}
        onDelete={onDelete}
        emptyLabel="No hay ubicaciones todavía."
      />

      <Modal isOpen={modal === 'create'} onClose={closeModal} title="Nueva ubicación">
        <LocationForm location={null} onSuccess={handleFormSuccess} onCancel={closeModal} showToast={showToast} />
      </Modal>

      <Modal isOpen={modal === 'edit'} onClose={closeModal} title={selected ? `Editar — ${selected.name}` : ''}>
        <LocationForm location={selected} onSuccess={handleFormSuccess} onCancel={closeModal} showToast={showToast} />
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
