const createEntityRepository = require('./createEntityRepository')
const db = require('../data/db')

const repository = createEntityRepository('glossary')

repository.removeTagFromAll = async (tag) => {
  const items = await db.getCollection('glossary')
  const affected = items.filter(i => (i.tags || []).includes(tag))
  for (const item of affected) {
    await db.updateInCollection('glossary', item.id, { ...item, tags: item.tags.filter(t => t !== tag) })
  }
  return affected.length
}

module.exports = repository
