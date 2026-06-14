const { Router } = require('express')
const CardController = require('../controllers/CardController')
const upload = require('../middleware/upload')
const { requireAuth } = require('../middleware/auth')

const router = Router()

router.get('/',     CardController.list)
router.get('/:id',  CardController.getById)
router.post('/',    requireAuth, upload.single('image'), CardController.create)
router.delete('/:id', requireAuth, CardController.remove)

module.exports = router
