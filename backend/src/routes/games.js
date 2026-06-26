const { Router } = require('express')
const GameController = require('../controllers/GameController')
const upload = require('../middleware/upload')
const { requireEditor } = require('../middleware/auth')

const router = Router()

router.get('/',              GameController.list)
router.get('/:id',           GameController.getOne)
router.post('/',             requireEditor, GameController.create)
router.put('/:id',           requireEditor, GameController.update)
router.delete('/:id',        requireEditor, GameController.remove)
router.post('/:id/image',    requireEditor, upload.single('image'), GameController.uploadImage)

module.exports = router
