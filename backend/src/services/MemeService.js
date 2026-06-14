const { v4: uuidv4 } = require('uuid')
const MemeRepository      = require('../repositories/MemeRepository')
const CharacterRepository  = require('../repositories/CharacterRepository')
const EventRepository      = require('../repositories/EventRepository')
const LocationRepository   = require('../repositories/LocationRepository')
const { uploadBuffer, destroyAsset } = require('../utils/cloudinary')
const { sanitizeIds } = require('../utils/sanitizeIds')

const EDITOR_ROLES = ['editor', 'admin', 'owner']

function present(meme, userId) {
  const { likes, ...rest } = meme
  return {
    ...rest,
    likes_count: (likes || []).length,
    liked_by_me: userId ? (likes || []).includes(userId) : false,
  }
}

const MemeService = {
  async list(userId) {
    const memes = await MemeRepository.findAll()
    return memes
      .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
      .map(m => present(m, userId))
  },

  async getById(id, userId) {
    const meme = await MemeRepository.findById(id)
    if (!meme) throw Object.assign(new Error('Meme no encontrado'), { status: 404 })
    return present(meme, userId)
  },

  async create({ file, body, user }) {
    if (!file) throw Object.assign(new Error('No se recibió ningún archivo'), { status: 400 })

    const result = await uploadBuffer(file.buffer, 'yakutown/memes')
    const meme = {
      id:               uuidv4(),
      filename:         file.originalname,
      url:              result.secure_url,
      cloudinary_id:    result.public_id,
      caption:          (body.caption || '').trim(),
      character_ids:    await sanitizeIds(body.character_ids, CharacterRepository),
      event_ids:        await sanitizeIds(body.event_ids, EventRepository),
      location_ids:     await sanitizeIds(body.location_ids, LocationRepository),
      likes:            [],
      uploaded_by:      user.id,
      uploaded_by_name: user.name,
      uploaded_at:      new Date().toISOString(),
    }
    await MemeRepository.create(meme)
    return present(meme, user.id)
  },

  async toggleLike(id, userId) {
    const meme = await MemeRepository.findById(id)
    if (!meme) throw Object.assign(new Error('Meme no encontrado'), { status: 404 })

    const likes = meme.likes || []
    const liked = likes.includes(userId)
    const updatedLikes = liked ? likes.filter(u => u !== userId) : [...likes, userId]
    const updated = await MemeRepository.update(id, { ...meme, likes: updatedLikes })
    return present(updated, userId)
  },

  // Any signed-in user can tag a meme with characters/events/locations.
  // Only the uploader or an editor can change its caption.
  async update(id, body, user) {
    const meme = await MemeRepository.findById(id)
    if (!meme) throw Object.assign(new Error('Meme no encontrado'), { status: 404 })

    const canEditCaption = meme.uploaded_by === user.id || EDITOR_ROLES.includes(user.role)
    if (body.caption !== undefined && !canEditCaption) {
      throw Object.assign(new Error('No tienes permisos para editar la descripción de este meme'), { status: 403 })
    }

    const updated = {
      ...meme,
      caption:       body.caption !== undefined ? (body.caption || '').trim() : meme.caption,
      character_ids: body.character_ids !== undefined ? await sanitizeIds(body.character_ids, CharacterRepository) : meme.character_ids,
      event_ids:     body.event_ids !== undefined ? await sanitizeIds(body.event_ids, EventRepository) : meme.event_ids,
      location_ids:  body.location_ids !== undefined ? await sanitizeIds(body.location_ids, LocationRepository) : meme.location_ids,
    }
    const saved = await MemeRepository.update(id, updated)
    return present(saved, user.id)
  },

  async remove(id, user) {
    const meme = await MemeRepository.findById(id)
    if (!meme) throw Object.assign(new Error('Meme no encontrado'), { status: 404 })
    if (meme.uploaded_by !== user.id && !EDITOR_ROLES.includes(user.role)) {
      throw Object.assign(new Error('No tienes permisos para eliminar este meme'), { status: 403 })
    }

    await destroyAsset(meme.cloudinary_id)
    await MemeRepository.remove(id)
    return { message: 'Meme eliminado', id }
  },
}

module.exports = MemeService
