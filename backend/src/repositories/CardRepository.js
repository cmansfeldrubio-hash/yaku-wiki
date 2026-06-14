const db = require('../data/db')

// All reads and writes to the cards collection go through here.
// No validation, no business rules — just data access.

const CardRepository = {
  async findAll() {
    return db.getCards()
  },

  async findById(id) {
    return (await db.getCard(id)) || null
  },

  async create(card) {
    return db.addCard(card)
  },

  async remove(id) {
    return db.removeCard(id)
  },
}

module.exports = CardRepository
