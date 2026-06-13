import { useState, useEffect, useCallback } from 'react'
import { getHome } from '../api/home'

export function useHome() {
  const [home, setHome] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getHome()
      setHome(data)
    } catch (e) {
      setError(e.message || 'Error al cargar la página de inicio')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { home, loading, error, reload: load }
}
