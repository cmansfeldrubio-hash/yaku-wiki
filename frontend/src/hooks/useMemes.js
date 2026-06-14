import { useState, useEffect, useCallback } from 'react'
import { getMemes } from '../api/memes'

export function useMemes() {
  const [memes, setMemes] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMemes()
      setMemes(data.memes)
      setTotal(data.total)
    } catch (e) {
      setError(e.message || 'Error al cargar los memes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { memes, total, loading, error, reload: load, setMemes }
}
