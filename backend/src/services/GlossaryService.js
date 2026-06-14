const { createEntityService } = require('./createEntityService')
const GlossaryRepository = require('../repositories/GlossaryRepository')

function sanitize(body) {
  return {
    name:        (body.name        || '').trim(),
    description: (body.description || '').trim(),
    tags:        Array.isArray(body.tags) ? body.tags.map(t => t.trim()).filter(Boolean) : [],
    image_url:   (body.image_url   || '').trim(),
  }
}

const service = createEntityService(GlossaryRepository, {
  sanitize,
  notFoundMessage: 'Concepto no encontrado',
  folder: 'glossary',
})

service.removeTag = async (tag) => {
  const clean = (tag || '').trim()
  if (!clean) throw Object.assign(new Error('tag es requerido'), { status: 400 })
  const affected = await GlossaryRepository.removeTagFromAll(clean)
  return { message: `Tag "${clean}" eliminado`, tag: clean, affected }
}

module.exports = service
