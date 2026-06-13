const { Router }    = require('express')
const StatsController = require('../controllers/StatsController')

const router = Router()

router.get('/', StatsController.get)

module.exports = router
