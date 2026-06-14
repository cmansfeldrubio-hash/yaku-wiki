const { Router } = require('express')
const PhotoController = require('../controllers/PhotoController')
const { galleryUpload } = require('../middleware/upload')
const { requireEditor } = require('../middleware/auth')

const router = Router()

router.get('/',     PhotoController.list)
router.post('/',         requireEditor, galleryUpload.single('image'), PhotoController.create)
router.post('/from-url', requireEditor, PhotoController.createFromUrl)
router.patch('/:id', requireEditor, PhotoController.update)
router.delete('/:id', requireEditor, PhotoController.remove)

module.exports = router
