import { useState, useEffect, useCallback } from 'react'
import { getCards } from '../api/cards'

export function useCards() {
  const [cards, setCards] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCards()
      setCards(data.cards)
      setTotal(data.total)
    } catch (e) {
      setError(e.message || 'Error al cargar las cartas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { cards, total, loading, error, reload: load, setCards }
}
