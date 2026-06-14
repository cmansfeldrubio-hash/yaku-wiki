const createEntityController = require('./createEntityController')
const GlossaryService = require('../services/GlossaryService')

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = {
  ...createEntityController(GlossaryService),

  removeTag: wrap(async (req, res) => {
    res.json(await GlossaryService.removeTag(req.params.tag))
  }),
}
