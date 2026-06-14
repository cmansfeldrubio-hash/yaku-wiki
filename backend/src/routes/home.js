const { Router } = require('express')
const HomeController = require('../controllers/HomeController')
const upload          = require('../middleware/upload')
const { requireOwner } = require('../middleware/auth')

const router = Router()

router.get('/',       HomeController.get)
router.put('/',       requireOwner, HomeController.update)
router.post('/image', requireOwner, upload.single('image'), HomeController.uploadImage)
router.post('/ad-image', requireOwner, upload.single('image'), HomeController.uploadAdImage)

module.exports = router
