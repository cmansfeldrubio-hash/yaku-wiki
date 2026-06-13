const createEntityController = require('./createEntityController')
const GlossaryService = require('../services/GlossaryService')

module.exports = createEntityController(GlossaryService)
