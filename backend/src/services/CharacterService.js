const { v4: uuidv4 } = require('uuid')
const CharacterRepository = require('../repositories/CharacterRepository')
const { uploadBuffer } = require('../utils/cloudinary')

function toSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function sanitizeSections(sections) {
  if (!Array.isArray(sections)) return []
  return sections
    .map(s => ({
      title:   (s?.title   || '').trim(),
      content: (s?.content || '').trim(),
    }))
    .filter(s => s.title)
    .map(s => ({ ...s, id: toSlug(s.title) }))
}

function sanitize(body) {
  return {
    name:         (body.name         || '').trim(),
    alias:        (body.alias        || '').trim(),
    origin:       (body.origin       || '').trim(),
    faction:      (body.faction      || 'otro').trim(),
    status:       (body.status       || 'activo').trim(),
    yakuma_title: !!body.yakuma_title,
    tags:         Array.isArray(body.tags) ? body.tags.map(t => t.trim()).filter(Boolean) : [],
    description:  (body.description  || '').trim(),
    hito:         (body.hito         || '').trim(),
    poder:        (body.poder        || '').trim(),
    relaciones:   Array.isArray(body.relaciones) ? body.relaciones : [],
    sections:     sanitizeSections(body.sections),
    image_url:    (body.image_url    || '').trim(),
  }
}

const CharacterService = {
  async list(filters) {
    const chars = await CharacterRepository.findAll(filters)
    return { total: chars.length, characters: chars }
  },

  async getById(id) {
    const char = await CharacterRepository.findById(id)
    if (!char) throw Object.assign(new Error('Personaje no encontrado'), { status: 404 })
    return char
  },

  async getBySlug(slug) {
    const char = await CharacterRepository.findBySlug(slug)
    if (!char) throw Object.assign(new Error('Personaje no encontrado'), { status: 404 })
    return char
  },

  async create(body) {
    const { name, faction } = body
    if (!name || !name.trim()) throw Object.assign(new Error('name es requerido'), { status: 400 })
    if (!faction)              throw Object.assign(new Error('faction es requerida'), { status: 400 })

    const now = new Date().toISOString()
    const data = sanitize(body)
    const newChar = {
      ...data,
      id:         uuidv4(),
      slug:       toSlug(data.name),
      created_at: now,
      updated_at: now,
    }
    return CharacterRepository.create(newChar)
  },

  async update(id, body) {
    const existing = await CharacterRepository.findById(id)
    if (!existing) throw Object.assign(new Error('Personaje no encontrado'), { status: 404 })

    const data = sanitize({ ...existing, ...body })
    const updated = {
      ...data,
      id:         existing.id,
      slug:       existing.slug,
      created_at: existing.created_at,
      updated_at: new Date().toISOString(),
    }
    return CharacterRepository.update(id, updated)
  },

  async patch(id, body) {
    const existing = await CharacterRepository.findById(id)
    if (!existing) throw Object.assign(new Error('Personaje no encontrado'), { status: 404 })

    const updated = {
      ...existing,
      ...body,
      id:         existing.id,
      slug:       existing.slug,
      created_at: existing.created_at,
      updated_at: new Date().toISOString(),
    }
    return CharacterRepository.update(id, updated)
  },

  async remove(id) {
    const existing = await CharacterRepository.findById(id)
    if (!existing) throw Object.assign(new Error('Personaje no encontrado'), { status: 404 })
    await CharacterRepository.remove(id)
    return { message: `${existing.name} eliminado de la wiki`, id: existing.id }
  },

  async setImage(id, file) {
    const existing = await CharacterRepository.findById(id)
    if (!existing) throw Object.assign(new Error('Personaje no encontrado'), { status: 404 })

    const result = await uploadBuffer(file.buffer, 'yakutown/characters')
    const updated = { ...existing, image_url: result.secure_url, updated_at: new Date().toISOString() }
    return CharacterRepository.update(id, updated)
  },
}

module.exports = CharacterService
