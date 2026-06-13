import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from '../hooks/useToast'

// Mock useCharacterBySlug hook
vi.mock('../hooks/useCharacterBySlug', () => ({
  useCharacterBySlug: vi.fn(),
}))

// Mock useAuth hook - default to editor permissions for existing tests
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { role: 'editor' }, canEdit: true, isOwner: false })),
}))

// Mock api/characters for delete
vi.mock('../api/characters', () => ({
  getCharacters: vi.fn().mockResolvedValue([]),
  getCharacterBySlug: vi.fn(),
  deleteCharacter: vi.fn(),
  createCharacter: vi.fn(),
  updateCharacter: vi.fn(),
  uploadImage: vi.fn(),
}))

// Mock useCharacters hook for HomePage
vi.mock('../hooks/useCharacters', () => ({
  useCharacters: vi.fn(() => ({
    characters: [],
    total: 0,
    loading: false,
    error: null,
    reload: vi.fn(),
  })),
}))

// Mock useStats hook
vi.mock('../hooks/useStats', () => ({
  useStats: vi.fn(() => ({
    stats: { total: 0, yakumas: 0, siniestros: 0, npcs: 0 },
    reload: vi.fn(),
  })),
}))

// Mock useFactions hook
vi.mock('../hooks/useFactions', () => ({
  useFactions: vi.fn(() => ({
    factions: [],
    reload: vi.fn(),
  })),
}))

import { useCharacterBySlug } from '../hooks/useCharacterBySlug'
import { useCharacters } from '../hooks/useCharacters'
import { deleteCharacter } from '../api/characters'
import CharacterPage from './CharacterPage'
import HomePage from './HomePage'
import CharacterCard from '../components/character/CharacterCard'
import App from '../App'

const mockCharacter = {
  id: 'abc-123',
  slug: 'kaneda-jr',
  name: 'Kaneda Jr',
  aliases: ['El Heredero'],
  origin: 'Providencia',
  faction: 'yakuma',
  status: 'activo',
  yakuma_title: true,
  tags: ['líder', 'estratega'],
  description: 'Líder de los Yakuma en la nueva era.',
  hito: 'Derrotó al sexto siniestro.',
  poder: 'Visión táctica sobrehumana.',
  image_url: '',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-02T00:00:00.000Z',
}

function renderWithRouter(ui, { initialEntries = ['/'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ToastProvider>
        {ui}
      </ToastProvider>
    </MemoryRouter>
  )
}

describe('CharacterCard navigation', () => {
  it('renders a link to /personaje/:slug', () => {
    renderWithRouter(
      <CharacterCard
        character={mockCharacter}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/personaje/kaneda-jr')
  })
})

describe('Route /personajes renders CharactersPage with CharacterGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders CharactersPage at route /personajes', () => {
    useCharacters.mockReturnValue({
      characters: [mockCharacter],
      total: 1,
      loading: false,
      error: null,
      reload: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/personajes']}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MemoryRouter>
    )

    // CharactersPage shows the character grid with character names
    expect(screen.getByText('Kaneda Jr')).toBeInTheDocument()
  })
})

describe('CharacterPage back link', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('back link navigates home preserving faction param', () => {
    useCharacterBySlug.mockReturnValue({
      character: mockCharacter,
      loading: false,
      error: null,
      retry: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/personaje/kaneda-jr?faction=yakuma']}>
        <ToastProvider>
          <Routes>
            <Route path="/personaje/:slug" element={<CharacterPage />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    )

    const backLink = screen.getByText('volver a la wiki')
    expect(backLink.closest('a')).toHaveAttribute('href', '/personajes?faction=yakuma')
  })

  it('back link goes to / when no faction param', () => {
    useCharacterBySlug.mockReturnValue({
      character: mockCharacter,
      loading: false,
      error: null,
      retry: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/personaje/kaneda-jr']}>
        <ToastProvider>
          <Routes>
            <Route path="/personaje/:slug" element={<CharacterPage />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    )

    const backLink = screen.getByText('volver a la wiki')
    expect(backLink.closest('a')).toHaveAttribute('href', '/personajes')
  })
})

describe('CharacterPage edit button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('edit button opens CharacterForm modal', async () => {
    useCharacterBySlug.mockReturnValue({
      character: mockCharacter,
      loading: false,
      error: null,
      retry: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/personaje/kaneda-jr']}>
        <ToastProvider>
          <Routes>
            <Route path="/personaje/:slug" element={<CharacterPage />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    )

    const editButton = screen.getByRole('button', { name: /editar/i })
    await userEvent.click(editButton)

    // The edit modal should be open with the character name in the title
    await waitFor(() => {
      expect(screen.getByText(`Editar — ${mockCharacter.name}`)).toBeInTheDocument()
    })
  })
})

describe('CharacterPage delete button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('delete button opens DeleteConfirmModal', async () => {
    useCharacterBySlug.mockReturnValue({
      character: mockCharacter,
      loading: false,
      error: null,
      retry: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/personaje/kaneda-jr']}>
        <ToastProvider>
          <Routes>
            <Route path="/personaje/:slug" element={<CharacterPage />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    )

    const deleteButton = screen.getByRole('button', { name: /eliminar/i })
    await userEvent.click(deleteButton)

    // The DeleteConfirmModal asks user to type "eliminar"
    await waitFor(() => {
      expect(screen.getByText(/Vas a eliminar a/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('eliminar')).toBeInTheDocument()
    })
  })

  it('after delete confirmation, navigates to /', async () => {
    useCharacterBySlug.mockReturnValue({
      character: mockCharacter,
      loading: false,
      error: null,
      retry: vi.fn(),
    })

    deleteCharacter.mockResolvedValue({})

    let currentPath = '/personaje/kaneda-jr'

    render(
      <MemoryRouter initialEntries={['/personaje/kaneda-jr']}>
        <ToastProvider>
          <Routes>
            <Route path="/personaje/:slug" element={<CharacterPage />} />
            <Route path="/personajes" element={<div data-testid="home-page">Home</div>} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    )

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /eliminar/i })
    await userEvent.click(deleteButton)

    // Type "eliminar" in the confirmation input
    const confirmInput = screen.getByPlaceholderText('eliminar')
    await userEvent.type(confirmInput, 'eliminar')

    // Click the confirm "eliminar" button in the modal
    const confirmButtons = screen.getAllByRole('button', { name: /eliminar/i })
    // The confirm button in the modal footer (not the trigger button)
    const confirmBtn = confirmButtons.find(btn => btn.textContent === 'eliminar' && btn !== deleteButton)
    await userEvent.click(confirmBtn)

    // After successful delete, should navigate to /personajes
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument()
    })

    expect(deleteCharacter).toHaveBeenCalledWith(mockCharacter.id)
  })
})
