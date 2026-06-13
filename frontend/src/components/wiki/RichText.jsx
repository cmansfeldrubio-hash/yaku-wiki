import { useMemo, Fragment } from 'react'
import { useWikiIndex } from '../../hooks/useWikiIndex'
import WikiLink from './WikiLink'

const MIN_TERM_LENGTH = 3

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Renders text with known wiki entities (characters, locations, events,
// glossary terms) auto-linked to their article, with a hover preview.
export default function RichText({ text, excludeSlug, as: Tag = 'p', className }) {
  const index = useWikiIndex()

  const { regex, termMap } = useMemo(() => {
    const map = new Map()
    for (const entry of index) {
      if (entry.slug === excludeSlug) continue
      for (const name of entry.names) {
        const trimmed = (name || '').trim()
        if (trimmed.length < MIN_TERM_LENGTH) continue
        const key = trimmed.toLowerCase()
        if (!map.has(key)) map.set(key, { term: trimmed, entry })
      }
    }
    if (map.size === 0) return { regex: null, termMap: map }
    const terms = [...map.values()].map(t => t.term).sort((a, b) => b.length - a.length)
    const pattern = terms.map(escapeRegExp).join('|')
    return { regex: new RegExp(`\\b(${pattern})\\b`, 'gi'), termMap: map }
  }, [index, excludeSlug])

  if (!text) return null
  if (!regex) return <Tag className={className}>{text}</Tag>

  const linkedSlugs = new Set()
  const parts = text.split(regex)

  return (
    <Tag className={className}>
      {parts.map((part, i) => {
        const match = termMap.get(part.toLowerCase())
        if (match && !linkedSlugs.has(match.entry.slug)) {
          linkedSlugs.add(match.entry.slug)
          return <WikiLink key={i} entry={match.entry}>{part}</WikiLink>
        }
        return <Fragment key={i}>{part}</Fragment>
      })}
    </Tag>
  )
}
