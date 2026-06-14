import { useState, useEffect, useCallback } from 'react'
import { getTerms } from '../api/glossary'

export function useGlossaryTags() {
  const [tags, setTags] = useState([])

  const load = useCallback(async () => {
    try {
      const { items } = await getTerms()
      const all = (items || []).flatMap(t => t.tags || [])
      setTags([...new Set(all)].sort((a, b) => a.localeCompare(b)))
    } catch {
      // silencioso
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { tags, reload: load }
}
