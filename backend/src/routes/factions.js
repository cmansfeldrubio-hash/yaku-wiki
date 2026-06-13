const { Router }    = require('express')
const FactionController = require('../controllers/FactionController')
const { requireEditor } = require('../middleware/auth')

const router = Router()

router.get('/',  FactionController.list)
router.post('/', requireEditor, FactionController.create)

module.exports = router
