const { createEntityService } = require('./createEntityService')
const YakumeadaRepository = require('../repositories/YakumeadaRepository')

function sanitize(body) {
  return {
    name:      (body.name      || '').trim(),
    excerpt:   (body.excerpt    || '').trim(),
    content:   (body.content    || '').trim(),
    tags:      Array.isArray(body.tags) ? body.tags.map(t => t.trim()).filter(Boolean) : [],
    image_url: (body.image_url  || '').trim(),
  }
}

module.exports = createEntityService(YakumeadaRepository, {
  sanitize,
  notFoundMessage: 'Yakumeada no encontrada',
  folder: 'yakumeadas',
})
