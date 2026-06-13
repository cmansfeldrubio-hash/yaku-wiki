const { Router } = require('express')
const CharacterController = require('../controllers/CharacterController')
const upload              = require('../middleware/upload')
const { requireEditor }   = require('../middleware/auth')

const router = Router()

router.get('/',           CharacterController.list)
router.get('/by-slug/:slug', CharacterController.getBySlug)
router.get('/:id',        CharacterController.getOne)
router.post('/',          requireEditor, CharacterController.create)
router.put('/:id',        requireEditor, CharacterController.update)
router.patch('/:id',      requireEditor, CharacterController.patch)
router.delete('/:id',     requireEditor, CharacterController.remove)
router.post('/:id/image', requireEditor, upload.single('image'), CharacterController.uploadImage)

module.exports = router
