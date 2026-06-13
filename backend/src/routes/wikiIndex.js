const { Router } = require('express')
const WikiIndexController = require('../controllers/WikiIndexController')

const router = Router()

router.get('/', WikiIndexController.get)

module.exports = router
