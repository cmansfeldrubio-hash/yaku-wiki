import { useState, useEffect, useCallback } from 'react'

export function useEntityList(getAll, search = '') {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAll({ search })
      setItems(data.items)
      setTotal(data.total)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [getAll, search])

  useEffect(() => { load() }, [load])

  return { items, total, loading, error, reload: load }
}
