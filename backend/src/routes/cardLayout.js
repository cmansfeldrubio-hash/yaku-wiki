const { Router } = require('express')
const CardLayoutController = require('../controllers/CardLayoutController')
const { requireOwner } = require('../middleware/auth')

const router = Router()

router.get('/', CardLayoutController.get)
router.put('/', requireOwner, CardLayoutController.update)

module.exports = router
