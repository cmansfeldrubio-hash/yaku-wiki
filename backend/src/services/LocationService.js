const { createEntityService } = require('./createEntityService')
const LocationRepository = require('../repositories/LocationRepository')

function sanitize(body) {
  return {
    name:        (body.name        || '').trim(),
    description: (body.description || '').trim(),
    type:        (body.type        || '').trim(),
    tags:        Array.isArray(body.tags) ? body.tags.map(t => t.trim()).filter(Boolean) : [],
    image_url:   (body.image_url   || '').trim(),
  }
}

module.exports = createEntityService(LocationRepository, {
  sanitize,
  notFoundMessage: 'Ubicación no encontrada',
  folder: 'locations',
})
