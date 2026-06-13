const db = require('../data/db')

const FactionRepository = {
  async findAll() {
    return db.getFactions()
  },

  async findById(id) {
    return (await db.getFaction(id)) || null
  },

  async create(faction) {
    return db.addFaction(faction)
  },
}

module.exports = FactionRepository
