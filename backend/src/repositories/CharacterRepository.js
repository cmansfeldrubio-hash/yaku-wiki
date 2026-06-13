const db = require('../data/db')

// All reads and writes to the characters collection go through here.
// No validation, no business rules — just data access.

const CharacterRepository = {
  async findAll({ faction, search } = {}) {
    let chars = await db.getCharacters()
    if (faction) {
      chars = chars.filter(c => c.faction === faction)
    }
    if (search) {
      const q = search.toLowerCase()
      chars = chars.filter(c =>
        c.name.toLowerCase().includes(q)          ||
        (c.alias  || '').toLowerCase().includes(q) ||
        (c.origin || '').toLowerCase().includes(q) ||
        (c.tags   || []).some(t => t.toLowerCase().includes(q))
      )
    }
    return chars
  },

  async findById(id) {
    return (await db.getCharacter(id)) || null
  },

  async findBySlug(slug) {
    const chars = await db.getCharacters()
    return chars.find(c => c.slug === slug) || null
  },

  async create(char) {
    return db.addCharacter(char)
  },

  async update(id, data) {
    return db.updateCharacter(id, data)
  },

  async remove(id) {
    return db.removeCharacter(id)
  },
}

module.exports = CharacterRepository
