const { Router } = require('express')
const GlossaryController = require('../controllers/GlossaryController')
const { requireEditor } = require('../middleware/auth')

const router = Router()

router.get('/',              GlossaryController.list)
router.get('/by-slug/:slug', GlossaryController.getBySlug)
router.get('/:id',           GlossaryController.getOne)
router.post('/',             requireEditor, GlossaryController.create)
router.put('/:id',           requireEditor, GlossaryController.update)
router.delete('/:id',        requireEditor, GlossaryController.remove)

module.exports = router
