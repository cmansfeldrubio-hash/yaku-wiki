const db = require('../data/db')

// All reads and writes to the home content singleton go through here.

const HomeRepository = {
  async get() {
    return db.getHomeContent()
  },

  async save(data) {
    return db.setHomeContent(data)
  },
}

module.exports = HomeRepository
