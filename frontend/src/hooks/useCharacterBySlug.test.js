import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useCharacterBySlug } from './useCharacterBySlug'

vi.mock('../api/characters', () => ({
  getCharacterBySlug: vi.fn(),
}))

import { getCharacterBySlug } from '../api/characters'

describe('useCharacterBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns character data on successful fetch', async () => {
    const mockCharacter = {
      id: '123',
      slug: 'kaneda-jr',
      name: 'Kaneda Jr',
      faction: 'yakuma',
      status: 'activo',
    }
    getCharacterBySlug.mockResolvedValue(mockCharacter)

    const { result } = renderHook(() => useCharacterBySlug('kaneda-jr'))

    // Initially loading
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.character).toEqual(mockCharacter)
    expect(result.current.error).toBeNull()
    expect(getCharacterBySlug).toHaveBeenCalledWith('kaneda-jr')
  })

  it('sets "Personaje no encontrado" error on 404 response', async () => {
    getCharacterBySlug.mockRejectedValue(new Error('404 - Personaje no encontrado'))

    const { result } = renderHook(() => useCharacterBySlug('nonexistent-slug'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.character).toBeNull()
    expect(result.current.error).toBe('Personaje no encontrado')
  })

  it('sets generic error message on network failure', async () => {
    getCharacterBySlug.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useCharacterBySlug('some-slug'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.character).toBeNull()
    expect(result.current.error).toBe('Error al cargar el personaje. Intenta de nuevo.')
  })

  it('retry() re-fetches the character data', async () => {
    getCharacterBySlug.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useCharacterBySlug('kaneda-jr'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Error al cargar el personaje. Intenta de nuevo.')
    expect(getCharacterBySlug).toHaveBeenCalledTimes(1)

    // Now mock a successful response for the retry
    const mockCharacter = { id: '123', slug: 'kaneda-jr', name: 'Kaneda Jr' }
    getCharacterBySlug.mockResolvedValueOnce(mockCharacter)

    // Call retry wrapped in act
    await act(async () => {
      await result.current.retry()
    })

    expect(getCharacterBySlug).toHaveBeenCalledTimes(2)
    expect(result.current.character).toEqual(mockCharacter)
    expect(result.current.error).toBeNull()
  })
})
