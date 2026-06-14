const db = require('../data/db')

// All reads and writes to the memes collection go through here.
// No validation, no business rules — just data access.

const MemeRepository = {
  async findAll() {
    return db.getMemes()
  },

  async findById(id) {
    return (await db.getMeme(id)) || null
  },

  async create(meme) {
    return db.addMeme(meme)
  },

  async update(id, data) {
    return db.updateMeme(id, data)
  },

  async remove(id) {
    return db.removeMeme(id)
  },
}

module.exports = MemeRepository
