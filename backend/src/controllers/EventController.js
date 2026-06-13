const createEntityController = require('./createEntityController')
const EventService = require('../services/EventService')

module.exports = createEntityController(EventService)
