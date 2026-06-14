const { v4: uuidv4 } = require('uuid')
const PhotoRepository     = require('../repositories/PhotoRepository')
const CharacterRepository = require('../repositories/CharacterRepository')
const EventRepository     = require('../repositories/EventRepository')
const LocationRepository  = require('../repositories/LocationRepository')
const { uploadBuffer, destroyAsset } = require('../utils/cloudinary')

async function sanitizeIds(raw, repository) {
  let ids = raw
  if (typeof ids === 'string') {
    try { ids = JSON.parse(ids) } catch { ids = ids.split(',').map(s => s.trim()) }
  }
  if (!Array.isArray(ids)) return []
  const unique = [...new Set(ids.filter(Boolean))]
  const checks = await Promise.all(unique.map(id => repository.findById(id)))
  return unique.filter((_, i) => !!checks[i])
}

const PhotoService = {
  async list({ characterId, eventId, locationId } = {}) {
    return PhotoRepository.findAll({ characterId, eventId, locationId })
  },

  async getById(id) {
    const photo = await PhotoRepository.findById(id)
    if (!photo) throw Object.assign(new Error('Foto no encontrada'), { status: 404 })
    return photo
  },

  async create({ file, body }) {
    if (!file) throw Object.assign(new Error('No se recibió ningún archivo'), { status: 400 })

    const result = await uploadBuffer(file.buffer, 'yakutown/gallery')

    const now = new Date().toISOString()
    const photo = {
      id:            uuidv4(),
      filename:      file.originalname,
      url:           result.secure_url,
      cloudinary_id: result.public_id,
      caption:       (body.caption || '').trim(),
      character_ids: await sanitizeIds(body.character_ids, CharacterRepository),
      event_ids:     await sanitizeIds(body.event_ids, EventRepository),
      location_ids:  await sanitizeIds(body.location_ids, LocationRepository),
      uploaded_at:   now,
    }
    return PhotoRepository.create(photo)
  },

  // Adds an existing entity banner image (character/location/event/glossary
  // image_url) to the gallery's photo catalog so it can be tagged/captioned
  // independently, without re-uploading to cloudinary.
  async createFromUrl({ url, caption, character_ids, event_ids, location_ids }) {
    const clean = (url || '').trim()
    if (!clean) throw Object.assign(new Error('url es requerida'), { status: 400 })

    const tags = {
      caption:       (caption || '').trim(),
      character_ids: await sanitizeIds(character_ids, CharacterRepository),
      event_ids:     await sanitizeIds(event_ids, EventRepository),
      location_ids:  await sanitizeIds(location_ids, LocationRepository),
    }

    // A photo for this url may already exist (e.g. tagged previously) — update
    // it in place instead of creating a duplicate gallery entry.
    const existing = (await PhotoRepository.findAll({})).find(p => p.url === clean)
    if (existing) {
      return PhotoRepository.update(existing.id, { ...existing, ...tags })
    }

    const photo = {
      id:            uuidv4(),
      filename:      clean.split('/').pop(),
      url:           clean,
      cloudinary_id: null,
      uploaded_at:   new Date().toISOString(),
      ...tags,
    }
    return PhotoRepository.create(photo)
  },

  async update(id, body) {
    const existing = await this.getById(id)
    const updated = {
      ...existing,
      caption:       body.caption !== undefined ? (body.caption || '').trim() : existing.caption,
      character_ids: body.character_ids !== undefined ? await sanitizeIds(body.character_ids, CharacterRepository) : existing.character_ids,
      event_ids:     body.event_ids !== undefined ? await sanitizeIds(body.event_ids, EventRepository) : (existing.event_ids || []),
      location_ids:  body.location_ids !== undefined ? await sanitizeIds(body.location_ids, LocationRepository) : (existing.location_ids || []),
    }
    return PhotoRepository.update(id, updated)
  },

  async remove(id) {
    const existing = await this.getById(id)
    await destroyAsset(existing.cloudinary_id)
    await PhotoRepository.remove(id)
    return { message: 'Foto eliminada', id: existing.id }
  },
}

module.exports = PhotoService
