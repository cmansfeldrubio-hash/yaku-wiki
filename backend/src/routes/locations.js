const { Router } = require('express')
const LocationController = require('../controllers/LocationController')
const upload = require('../middleware/upload')
const { requireEditor } = require('../middleware/auth')

const router = Router()

router.get('/',              LocationController.list)
router.get('/by-slug/:slug', LocationController.getBySlug)
router.get('/:id',           LocationController.getOne)
router.post('/',             requireEditor, LocationController.create)
router.put('/:id',           requireEditor, LocationController.update)
router.delete('/:id',        requireEditor, LocationController.remove)
router.post('/:id/image',    requireEditor, upload.single('image'), LocationController.uploadImage)

module.exports = router
