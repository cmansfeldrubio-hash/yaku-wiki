import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import { useCharacters } from '../hooks/useCharacters'
import { useStats } from '../hooks/useStats'
import { useFactions } from '../hooks/useFactions'
import { deleteCharacter } from '../api/characters'

import Sidebar from '../components/layout/Sidebar'
import SearchInput from '../components/ui/SearchInput'
import CharacterGrid from '../components/character/CharacterGrid'
import CharacterForm from '../components/character/CharacterForm'
import FactionForm from '../components/faction/FactionForm'
import Modal from '../components/ui/Modal'
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal'

import styles from './CharactersPage.module.css'

export default function CharactersPage() {
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeFaction = searchParams.get('faction') || ''
  const setActiveFaction = (faction) => {
    if (faction) {
      setSearchParams({ faction })
    } else {
      setSearchParams({})
    }
  }

  const [search, setSearch] = useState('')
  const handleSearch = useCallback((val) => setSearch(val), [])

  const { characters, total, loading, error, reload: reloadChars } = useCharacters(activeFaction, search)
  const { stats, reload: reloadStats } = useStats()
  const { factions, reload: reloadFactions } = useFactions()

  const factionCounts = {
    total: stats.total,
    yakuma: stats.yakumas,
    'seis-siniestros': stats.siniestros,
    npc: stats.npcs,
  }

  // Modal state
  const [modal, setModal] = useState(null) // 'create' | 'edit' | 'delete' | 'faction'
  const [selected, setSelected] = useState(null)

  const closeModal = () => { setModal(null); setSelected(null) }

  const onEdit = (char) => { setSelected(char); setModal('edit') }
  const onDelete = (char) => { setSelected(char); setModal('delete') }
  const onNewCharacter = () => { setSelected(null); setModal('create') }
  const onNewFaction = () => setModal('faction')

  const afterMutation = async () => {
    await Promise.all([reloadChars(), reloadStats(), reloadFactions()])
  }

  const handleFormSuccess = async () => {
    const action = modal === 'create' ? 'Personaje creado' : 'Personaje actualizado'
    closeModal()
    await afterMutation()
    showToast(action, 'success')
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteCharacter(selected.id)
      closeModal()
      await afterMutation()
      showToast(`${selected.name} eliminado`, 'success')
    } catch (e) {
      showToast(e.message || 'Error eliminando', 'error')
    }
  }

  const handleFactionSuccess = async () => {
    closeModal()
    await reloadFactions()
    await reloadStats()
  }

  const sectionLabel = {
    '': 'todos los personajes',
    yakuma: 'yakumas',
    'seis-siniestros': 'los seis siniestros',
    npc: 'npcs',
    otro: 'otros',
  }

  return (
    <>
      <div className={styles.layout}>
        <Sidebar
          factionCounts={factionCounts}
          activeFaction={activeFaction}
          onFactionChange={setActiveFaction}
          onNewCharacter={onNewCharacter}
          onNewFaction={onNewFaction}
        />
        <main className={styles.main}>
          <SearchInput onChange={handleSearch} />
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>{sectionLabel[activeFaction] ?? activeFaction}</span>
            <span className={styles.resultsCount}>{total} personajes</span>
          </div>
          <CharacterGrid
            characters={characters}
            loading={loading}
            error={error}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </main>
      </div>

      {/* Create modal */}
      <Modal isOpen={modal === 'create'} onClose={closeModal} title="Nuevo personaje">
        <CharacterForm character={null} onSuccess={handleFormSuccess} onCancel={closeModal} showToast={showToast} />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={modal === 'edit'} onClose={closeModal} title={selected ? `Editar — ${selected.name}` : ''}>
        <CharacterForm character={selected} onSuccess={handleFormSuccess} onCancel={closeModal} showToast={showToast} />
      </Modal>

      {/* Delete confirm */}
      {modal === 'delete' && selected && (
        <DeleteConfirmModal
          characterName={selected.name}
          onConfirm={handleDeleteConfirm}
          onCancel={closeModal}
        />
      )}

      {/* Faction modal */}
      <Modal isOpen={modal === 'faction'} onClose={closeModal} title="Nueva facción" maxWidth="440px">
        <FactionForm onSuccess={handleFactionSuccess} onCancel={closeModal} showToast={showToast} />
      </Modal>
    </>
  )
}
