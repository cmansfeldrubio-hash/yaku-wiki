const CardLayoutRepository = require('../repositories/CardLayoutRepository')

const EMPTY = { id: 'layout', overrides: {}, updated_at: null }

const CardLayoutService = {
  async get() {
    const existing = await CardLayoutRepository.get()
    return existing || EMPTY
  },

  async update(body) {
    const overrides = (body.overrides && typeof body.overrides === 'object') ? body.overrides : {}
    // The image box is per-browser only and never shared globally.
    const { image, ...sharedOverrides } = overrides
    const data = {
      id:         'layout',
      overrides:  sharedOverrides,
      updated_at: new Date().toISOString(),
    }
    return CardLayoutRepository.save(data)
  },
}

module.exports = CardLayoutService
