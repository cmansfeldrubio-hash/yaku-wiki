import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import { useEntityList } from '../hooks/useEntityList'
import { getTerms, deleteTerm } from '../api/glossary'
import SearchInput from '../components/ui/SearchInput'
import EntityGrid from '../components/ui/EntityGrid'
import GlossaryForm from '../components/glossary/GlossaryForm'
import Modal from '../components/ui/Modal'
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal'
import styles from './EntityListPage.module.css'

export default function GlossaryPage() {
  const { showToast } = useToast()
  const { canEdit } = useAuth()
  const [search, setSearch] = useState('')
  const handleSearch = useCallback((val) => setSearch(val), [])

  const { items: terms, total, loading, error, reload } = useEntityList(getTerms, search)

  const [modal, setModal] = useState(null) // 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null)

  const closeModal = () => { setModal(null); setSelected(null) }
  const onEdit = (item) => { setSelected(item); setModal('edit') }
  const onDelete = (item) => { setSelected(item); setModal('delete') }

  const handleFormSuccess = async () => {
    const action = modal === 'create' ? 'Concepto creado' : 'Concepto actualizado'
    closeModal()
    await reload()
    showToast(action, 'success')
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteTerm(selected.id)
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
          <h1 className={styles.title}>la palabra</h1>
          <span className={styles.count}>{total} conceptos</span>
        </div>
        {canEdit && <button className={styles.newBtn} onClick={() => setModal('create')}>+ nuevo concepto</button>}
      </div>

      <div className={styles.search}>
        <SearchInput onChange={handleSearch} />
      </div>

      <EntityGrid
        items={terms}
        loading={loading}
        error={error}
        basePath="/la-palabra"
        icon="§"
        getSubtitle={(item) => item.tags?.join(', ')}
        onEdit={onEdit}
        onDelete={onDelete}
        emptyLabel="No hay conceptos todavía."
      />

      <Modal isOpen={modal === 'create'} onClose={closeModal} title="Nuevo concepto">
        <GlossaryForm term={null} onSuccess={handleFormSuccess} onCancel={closeModal} showToast={showToast} />
      </Modal>

      <Modal isOpen={modal === 'edit'} onClose={closeModal} title={selected ? `Editar — ${selected.name}` : ''}>
        <GlossaryForm term={selected} onSuccess={handleFormSuccess} onCancel={closeModal} showToast={showToast} />
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
