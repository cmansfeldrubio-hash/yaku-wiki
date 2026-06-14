const db = require('../data/db')

// All reads and writes to the global card layout singleton go through here.

const CardLayoutRepository = {
  async get() {
    return db.getCardLayout()
  },

  async save(data) {
    return db.setCardLayout(data)
  },
}

module.exports = CardLayoutRepository
