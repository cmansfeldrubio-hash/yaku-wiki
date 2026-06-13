import { useState, useEffect, useCallback } from 'react'

export function useEntityBySlug(getBySlug, slug, notFoundLabel) {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!slug) return
    setLoading(true)
    setError(null)
    try {
      const data = await getBySlug(slug)
      setItem(data)
    } catch (e) {
      if (e.message.includes('404') || e.message.toLowerCase().includes('no encontrad')) {
        setError(`${notFoundLabel} no encontrado`)
      } else {
        setError(`Error al cargar ${notFoundLabel.toLowerCase()}. Intenta de nuevo.`)
      }
      setItem(null)
    } finally {
      setLoading(false)
    }
  }, [getBySlug, slug, notFoundLabel])

  useEffect(() => { load() }, [load])

  return { item, loading, error, retry: load }
}
