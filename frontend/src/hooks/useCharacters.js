import { useState, useEffect, useCallback } from 'react'
import { getCharacters } from '../api/characters'

export function useCharacters(faction, search) {
  const [characters, setCharacters] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCharacters({ faction, search })
      setCharacters(data.characters)
      setTotal(data.total)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [faction, search])

  useEffect(() => { load() }, [load])

  return { characters, total, loading, error, reload: load }
}
