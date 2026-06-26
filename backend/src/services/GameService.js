const { createEntityService } = require('./createEntityService')
const GameRepository = require('../repositories/GameRepository')

function sanitize(body) {
  return {
    name:        (body.name        || '').trim(),
    description: (body.description || '').trim(),
    url:         (body.url         || '').trim(),
    image_url:   (body.image_url   || '').trim(),
  }
}

module.exports = createEntityService(GameRepository, {
  sanitize,
  notFoundMessage: 'Juego no encontrado',
  folder: 'games',
})
