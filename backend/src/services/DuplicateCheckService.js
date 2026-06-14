const CharacterRepository = require('../repositories/CharacterRepository')
const LocationRepository  = require('../repositories/LocationRepository')
const EventRepository     = require('../repositories/EventRepository')
const GlossaryRepository  = require('../repositories/GlossaryRepository')

// All wiki entity types whose names/aliases feed the auto-link index
// (WikiIndexService / RichText). A duplicate name or alias anywhere in
// this list makes auto-links ambiguous, so new/edited entries are
// checked against all of them.
const SOURCES = [
  { repo: CharacterRepository, label: 'un personaje',                  names: c => [c.name, ...(c.aliases || [])] },
  { repo: LocationRepository,  label: 'una ubicación',                 names: l => [l.name] },
  { repo: EventRepository,     label: 'un evento',                     names: e => [e.name] },
  { repo: GlossaryRepository,  label: 'un concepto de "la palabra"',   names: g => [g.name] },
]

// Returns a description of the first existing entity (of any type) whose
// name or alias matches `name` (case-insensitive), excluding `excludeId`.
async function findNameCollision(name, { excludeId } = {}) {
  const clean = (name || '').trim().toLowerCase()
  if (!clean) return null

  for (const { repo, label, names } of SOURCES) {
    const items = await repo.findAll()
    for (const item of items) {
      if (item.id === excludeId) continue
      if (names(item).some(n => (n || '').trim().toLowerCase() === clean)) {
        return { label, name: item.name }
      }
    }
  }
  return null
}

module.exports = { findNameCollision }
