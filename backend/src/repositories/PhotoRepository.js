const db = require('../data/db')

// All reads and writes to the photos collection go through here.
// No validation, no business rules — just data access.

const PhotoRepository = {
  async findAll({ characterId, eventId, locationId } = {}) {
    let photos = await db.getPhotos()
    if (characterId) {
      photos = photos.filter(p => (p.character_ids || []).includes(characterId))
    }
    if (eventId) {
      photos = photos.filter(p => (p.event_ids || []).includes(eventId))
    }
    if (locationId) {
      photos = photos.filter(p => (p.location_ids || []).includes(locationId))
    }
    return photos
  },

  async findById(id) {
    return (await db.getPhoto(id)) || null
  },

  async create(photo) {
    return db.addPhoto(photo)
  },

  async update(id, data) {
    return db.updatePhoto(id, data)
  },

  async remove(id) {
    return db.removePhoto(id)
  },
}

module.exports = PhotoRepository
