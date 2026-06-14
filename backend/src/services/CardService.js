const { v4: uuidv4 } = require('uuid')
const CardRepository = require('../repositories/CardRepository')
const CharacterRepository = require('../repositories/CharacterRepository')
const { uploadBuffer, destroyAsset } = require('../utils/cloudinary')

const EDITOR_ROLES = ['editor', 'admin', 'owner']
const CARD_TYPES = ['personaje', 'efecto']
const RARITIES = ['comun', 'infrecuente', 'rara', 'epica', 'legendaria']

const CardService = {
  async list() {
    const cards = await CardRepository.findAll()
    return cards.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },

  async getById(id) {
    const card = await CardRepository.findById(id)
    if (!card) throw Object.assign(new Error('Carta no encontrada'), { status: 404 })
    return card
  },

  async create({ file, body, user }) {
    if (!file) throw Object.assign(new Error('No se recibió ningún archivo'), { status: 400 })

    const cardType = CARD_TYPES.includes(body.card_type) ? body.card_type : 'efecto'
    const rarity = RARITIES.includes(body.rarity) ? body.rarity : 'comun'
    const name = (body.name || '').trim()
    if (!name) throw Object.assign(new Error('La carta necesita un nombre'), { status: 400 })

    let cost = Number.parseInt(body.cost, 10)
    if (Number.isNaN(cost)) cost = 0
    cost = Math.min(9, Math.max(0, cost))

    let sourceImageUrl = ''
    let characterId = ''
    if (cardType === 'personaje' && body.character_id) {
      const character = await CharacterRepository.findById(body.character_id)
      if (character) {
        characterId = character.id
        sourceImageUrl = character.image_url || ''
      }
    }

    const result = await uploadBuffer(file.buffer, 'yakutown/cards')
    const card = {
      id: uuidv4(),
      card_type: cardType,
      name,
      subtype: (body.subtype || '').trim(),
      rarity,
      cost,
      effect_text: (body.effect_text || '').trim(),
      character_id: characterId,
      source_image_url: sourceImageUrl,
      rendered_url: result.secure_url,
      rendered_cloudinary_id: result.public_id,
      created_by: user.id,
      created_by_name: user.name,
      created_at: new Date().toISOString(),
    }
    return CardRepository.create(card)
  },

  async remove(id, user) {
    const card = await CardRepository.findById(id)
    if (!card) throw Object.assign(new Error('Carta no encontrada'), { status: 404 })
    if (card.created_by !== user.id && !EDITOR_ROLES.includes(user.role)) {
      throw Object.assign(new Error('No tienes permisos para eliminar esta carta'), { status: 403 })
    }

    await destroyAsset(card.rendered_cloudinary_id)
    await CardRepository.remove(id)
    return { message: 'Carta eliminada', id }
  },
}

module.exports = CardService
