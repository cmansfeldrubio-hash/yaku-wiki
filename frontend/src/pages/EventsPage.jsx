import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import { useEntityList } from '../hooks/useEntityList'
import { getEvents, deleteEvent } from '../api/events'
import { getLocations } from '../api/locations'
import SearchInput from '../components/ui/SearchInput'
import EntityGrid from '../components/ui/EntityGrid'
import EventForm from '../components/event/EventForm'
import Modal from '../components/ui/Modal'
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal'
import styles from './EntityListPage.module.css'

export default function EventsPage() {
  const { showToast } = useToast()
  const { canEdit } = useAuth()
  const [search, setSearch] = useState('')
  const handleSearch = useCallback((val) => setSearch(val), [])

  const { items: events, total, loading, error, reload } = useEntityList(getEvents, search)
  const { items: locations } = useEntityList(getLocations)
  const locationById = Object.fromEntries(locations.map(l => [l.id, l]))

  const [modal, setModal] = useState(null) // 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null)

  const closeModal = () => { setModal(null); setSelected(null) }
  const onEdit = (item) => { setSelected(item); setModal('edit') }
  const onDelete = (item) => { setSelected(item); setModal('delete') }

  const handleFormSuccess = async () => {
    const action = modal === 'create' ? 'Evento creado' : 'Evento actualizado'
    closeModal()
    await reload()
    showToast(action, 'success')
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteEvent(selected.id)
      closeModal()
      await reload()
      showToast(`${selected.name} eliminado`, 'success')
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
          <h1 className={styles.title}>eventos</h1>
          <span className={styles.count}>{total} eventos</span>
        </div>
        {canEdit && <button className={styles.newBtn} onClick={() => setModal('create')}>+ nuevo evento</button>}
      </div>

      <div className={styles.search}>
        <SearchInput onChange={handleSearch} />
      </div>

      <EntityGrid
        items={events}
        loading={loading}
        error={error}
        basePath="/evento"
        icon="◆"
        getSubtitle={(item) => [item.date, locationById[item.location_id]?.name].filter(Boolean).join(' · ')}
        onEdit={onEdit}
        onDelete={onDelete}
        emptyLabel="No hay eventos todavía."
      />

      <Modal isOpen={modal === 'create'} onClose={closeModal} title="Nuevo evento">
        <EventForm event={null} onSuccess={handleFormSuccess} onCancel={closeModal} showToast={showToast} />
      </Modal>

      <Modal isOpen={modal === 'edit'} onClose={closeModal} title={selected ? `Editar — ${selected.name}` : ''}>
        <EventForm event={selected} onSuccess={handleFormSuccess} onCancel={closeModal} showToast={showToast} />
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
