const { Router } = require('express')
const MemeController = require('../controllers/MemeController')
const upload = require('../middleware/upload')
const { requireAuth } = require('../middleware/auth')

const router = Router()

router.get('/',          MemeController.list)
router.post('/',          requireAuth, upload.single('image'), MemeController.create)
router.post('/:id/like',  requireAuth, MemeController.toggleLike)
router.patch('/:id',      requireAuth, MemeController.update)
router.delete('/:id',     requireAuth, MemeController.remove)

module.exports = router
