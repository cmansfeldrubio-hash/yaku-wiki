import { useState, useEffect, useCallback } from 'react'
import { getFactions } from '../api/factions'

export function useFactions() {
  const [factions, setFactions] = useState([])

  const load = useCallback(async () => {
    try {
      const data = await getFactions()
      setFactions(data)
    } catch (e) {
      // silencioso
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { factions, reload: load }
}
