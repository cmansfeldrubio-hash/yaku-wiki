const CharacterRepository = require('../repositories/CharacterRepository')
const LocationRepository  = require('../repositories/LocationRepository')
const EventRepository     = require('../repositories/EventRepository')
const GlossaryRepository  = require('../repositories/GlossaryRepository')

const EXCERPT_LENGTH = 160

function excerpt(text) {
  if (!text) return ''
  const trimmed = text.trim()
  return trimmed.length > EXCERPT_LENGTH ? `${trimmed.slice(0, EXCERPT_LENGTH).trim()}…` : trimmed
}

function toEntry(item, { type, pathPrefix, names }) {
  return {
    type,
    slug:       item.slug,
    path:       `/${pathPrefix}/${item.slug}`,
    names:      names.filter(Boolean),
    excerpt:    excerpt(item.description),
    image_url:  item.image_url || '',
    created_at: item.created_at || null,
  }
}

const WikiIndexService = {
  async get() {
    const [characters, locations, events, glossary] = await Promise.all([
      CharacterRepository.findAll(),
      LocationRepository.findAll(),
      EventRepository.findAll(),
      GlossaryRepository.findAll(),
    ])

    return [
      ...characters.map(c => toEntry(c, { type: 'character', pathPrefix: 'personaje',   names: [c.name, ...(c.aliases || [])] })),
      ...locations.map(l  => toEntry(l, { type: 'location',  pathPrefix: 'ubicacion',   names: [l.name] })),
      ...events.map(e     => toEntry(e, { type: 'event',     pathPrefix: 'evento',      names: [e.name] })),
      ...glossary.map(g   => toEntry(g, { type: 'glossary',  pathPrefix: 'la-palabra',  names: [g.name] })),
    ]
  },
}

module.exports = WikiIndexService
