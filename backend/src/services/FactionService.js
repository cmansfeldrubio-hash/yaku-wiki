const FactionRepository   = require('../repositories/FactionRepository')
const CharacterRepository = require('../repositories/CharacterRepository')

const FactionService = {
  async list() {
    const factions = await FactionRepository.findAll()
    const chars    = await CharacterRepository.findAll()

    // Attach live character count to each faction
    return factions.map(f => ({
      ...f,
      count: chars.filter(c => c.faction === f.id).length,
    }))
  },

  async create(body) {
    const label = (body.label || '').trim()
    const color = (body.color || '#808080').trim()

    if (!label) throw Object.assign(new Error('label es requerido'), { status: 400 })

    // Derive a stable id from the label
    const id = label
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    if (await FactionRepository.findById(id)) {
      throw Object.assign(new Error(`La facción "${label}" ya existe`), { status: 409 })
    }

    return FactionRepository.create({ id, label, color })
  },
}

module.exports = FactionService
