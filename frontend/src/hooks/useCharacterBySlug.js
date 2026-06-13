import { useState, useEffect, useCallback } from 'react'
import { getCharacterBySlug } from '../api/characters'

export function useCharacterBySlug(slug) {
  const [character, setCharacter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!slug) return
    setLoading(true)
    setError(null)
    try {
      const data = await getCharacterBySlug(slug)
      setCharacter(data)
    } catch (e) {
      if (e.message.includes('404') || e.message.toLowerCase().includes('no encontrado')) {
        setError('Personaje no encontrado')
      } else {
        setError('Error al cargar el personaje. Intenta de nuevo.')
      }
      setCharacter(null)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { load() }, [load])

  return { character, loading, error, retry: load }
}
