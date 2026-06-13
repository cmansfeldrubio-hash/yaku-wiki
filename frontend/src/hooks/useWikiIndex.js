import { useState, useEffect } from 'react'
import { getWikiIndex } from '../api/wikiIndex'

// Module-level cache: the index rarely changes within a session, so fetch
// it once and share it across every page that renders RichText.
let cache = null
let inflight = null

function load() {
  if (cache) return Promise.resolve(cache)
  if (!inflight) {
    inflight = getWikiIndex()
      .then(data => { cache = data; return data })
      .catch(() => { inflight = null; return [] })
  }
  return inflight
}

export function useWikiIndex() {
  const [index, setIndex] = useState(cache || [])

  useEffect(() => {
    if (cache) return
    load().then(setIndex)
  }, [])

  return index
}
