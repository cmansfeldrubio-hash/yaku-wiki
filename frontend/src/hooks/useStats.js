import { useState, useEffect, useCallback } from 'react'
import { getStats } from '../api/stats'

export function useStats() {
  const [stats, setStats] = useState({ total: 0, yakumas: 0, siniestros: 0, npcs: 0, leyendas: 0 })

  const load = useCallback(async () => {
    try {
      const data = await getStats()
      setStats(data)
    } catch (e) {
      // silencioso — stats son decorativos
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { stats, reload: load }
}
