import { useState, useEffect, useCallback } from 'react'
import { getPhotos } from '../api/photos'

export function usePhotos(filters = {}) {
  const { characterId, eventId, locationId } = filters
  const [photos, setPhotos] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const skip = Object.values(filters).some(v => v === undefined)

  const load = useCallback(async () => {
    if (skip) return
    setLoading(true)
    setError(null)
    try {
      const data = await getPhotos({ characterId, eventId, locationId })
      setPhotos(data.photos)
      setTotal(data.total)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [characterId, eventId, locationId, skip])

  useEffect(() => { load() }, [load])

  return { photos, total, loading, error, reload: load }
}
