const db = require('../data/db')

// Generic repository factory for simple top-level collections (events, locations).
// No validation, no business rules — just data access.

function createEntityRepository(collection) {
  return {
    async findAll({ search } = {}) {
      let items = await db.getCollection(collection)
      if (search) {
        const q = search.toLowerCase()
        items = items.filter(i =>
          i.name.toLowerCase().includes(q) ||
          (i.tags || []).some(t => t.toLowerCase().includes(q))
        )
      }
      return items
    },

    async findById(id) {
      return (await db.getFromCollection(collection, id)) || null
    },

    async findBySlug(slug) {
      const items = await db.getCollection(collection)
      return items.find(i => i.slug === slug) || null
    },

    async create(item) {
      return db.addToCollection(collection, item)
    },

    async update(id, data) {
      return db.updateInCollection(collection, id, data)
    },

    async remove(id) {
      return db.removeFromCollection(collection, id)
    },
  }
}

module.exports = createEntityRepository
