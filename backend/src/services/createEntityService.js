const { v4: uuidv4 } = require('uuid')
const { toSlug } = require('../utils/slug')
const { uploadBuffer } = require('../utils/cloudinary')
const { findNameCollision } = require('./DuplicateCheckService')

function duplicateError(collision) {
  return Object.assign(
    new Error(`Ya existe ${collision.label} llamado "${collision.name}" — elige otro nombre`),
    { status: 409 }
  )
}

// Generic service factory for simple top-level collections (events, locations).
// `sanitize` validates/normalizes the request body into storable fields.

function createEntityService(repository, { sanitize, notFoundMessage, folder }) {
  return {
    async list(filters) {
      const items = await repository.findAll(filters)
      return { total: items.length, items }
    },

    async getById(id) {
      const item = await repository.findById(id)
      if (!item) throw Object.assign(new Error(notFoundMessage), { status: 404 })
      return item
    },

    async getBySlug(slug) {
      const item = await repository.findBySlug(slug)
      if (!item) throw Object.assign(new Error(notFoundMessage), { status: 404 })
      return item
    },

    async create(body) {
      if (!body.name || !body.name.trim()) throw Object.assign(new Error('name es requerido'), { status: 400 })

      const collision = await findNameCollision(body.name)
      if (collision) throw duplicateError(collision)

      const now = new Date().toISOString()
      const data = sanitize(body)
      const newItem = {
        ...data,
        id:         uuidv4(),
        slug:       toSlug(data.name),
        created_at: now,
        updated_at: now,
      }
      return repository.create(newItem)
    },

    async update(id, body) {
      const existing = await this.getById(id)

      if (body.name && body.name.trim() && body.name.trim() !== existing.name) {
        const collision = await findNameCollision(body.name, { excludeId: existing.id })
        if (collision) throw duplicateError(collision)
      }

      const data = sanitize({ ...existing, ...body })
      const updated = {
        ...data,
        id:         existing.id,
        slug:       existing.slug,
        created_at: existing.created_at,
        updated_at: new Date().toISOString(),
      }
      return repository.update(id, updated)
    },

    async remove(id) {
      const existing = await this.getById(id)
      await repository.remove(id)
      return { message: `${existing.name} eliminado`, id: existing.id }
    },

    async setImage(id, file) {
      const existing = await this.getById(id)
      const result = await uploadBuffer(file.buffer, `yakutown/${folder}`)
      return repository.update(id, { ...existing, image_url: result.secure_url, updated_at: new Date().toISOString() })
    },
  }
}

module.exports = { createEntityService }
