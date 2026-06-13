const { Router } = require('express')
const EventController = require('../controllers/EventController')
const upload = require('../middleware/upload')
const { requireEditor } = require('../middleware/auth')

const router = Router()

router.get('/',              EventController.list)
router.get('/by-slug/:slug', EventController.getBySlug)
router.get('/:id',           EventController.getOne)
router.post('/',             requireEditor, EventController.create)
router.put('/:id',           requireEditor, EventController.update)
router.delete('/:id',        requireEditor, EventController.remove)
router.post('/:id/image',    requireEditor, upload.single('image'), EventController.uploadImage)

module.exports = router
