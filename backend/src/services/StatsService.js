const CharacterRepository = require('../repositories/CharacterRepository')

const StatsService = {
  async get() {
    const chars = await CharacterRepository.findAll()
    return {
      total:      chars.length,
      yakumas:    chars.filter(c => c.yakuma_title).length,
      siniestros: chars.filter(c => c.faction === 'seis-siniestros').length,
      npcs:       chars.filter(c => c.faction === 'npc').length,
      leyendas:   chars.filter(c => c.status  === 'leyenda').length,
    }
  },
}

module.exports = StatsService
