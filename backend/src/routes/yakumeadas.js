const { Router } = require('express')
const YakumeadaController = require('../controllers/YakumeadaController')
const upload = require('../middleware/upload')
const { requireEditor } = require('../middleware/auth')

const router = Router()

router.get('/',              YakumeadaController.list)
router.get('/by-slug/:slug', YakumeadaController.getBySlug)
router.get('/:id',           YakumeadaController.getOne)
router.post('/',             requireEditor, YakumeadaController.create)
router.put('/:id',           requireEditor, YakumeadaController.update)
router.delete('/:id',        requireEditor, YakumeadaController.remove)
router.post('/:id/image',    requireEditor, upload.single('image'), YakumeadaController.uploadImage)

module.exports = router
