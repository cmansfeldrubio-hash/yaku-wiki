const createEntityController = require('./createEntityController')
const GameService = require('../services/GameService')

module.exports = createEntityController(GameService)
