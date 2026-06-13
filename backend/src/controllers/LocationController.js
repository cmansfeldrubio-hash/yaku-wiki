const createEntityController = require('./createEntityController')
const LocationService = require('../services/LocationService')

module.exports = createEntityController(LocationService)
