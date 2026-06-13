const { createEntityService } = require('./createEntityService')
const GlossaryRepository = require('../repositories/GlossaryRepository')

function sanitize(body) {
  return {
    name:        (body.name        || '').trim(),
    description: (body.description || '').trim(),
    tags:        Array.isArray(body.tags) ? body.tags.map(t => t.trim()).filter(Boolean) : [],
  }
}

module.exports = createEntityService(GlossaryRepository, {
  sanitize,
  notFoundMessage: 'Concepto no encontrado',
})
