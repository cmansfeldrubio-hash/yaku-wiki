const { createEntityService } = require('./createEntityService')
const EventRepository = require('../repositories/EventRepository')

function sanitize(body) {
  return {
    name:        (body.name        || '').trim(),
    description: (body.description || '').trim(),
    date:        (body.date        || '').trim(),
    location_id: (body.location_id || '').trim(),
    tags:        Array.isArray(body.tags) ? body.tags.map(t => t.trim()).filter(Boolean) : [],
    image_url:   (body.image_url   || '').trim(),
  }
}

module.exports = createEntityService(EventRepository, {
  sanitize,
  notFoundMessage: 'Evento no encontrado',
  folder: 'events',
})
