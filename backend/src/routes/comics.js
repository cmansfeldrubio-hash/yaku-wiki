const { Router } = require('express')
const ComicController = require('../controllers/comicController')
const upload = require('../middleware/upload')
const { requireEditor } = require('../middleware/auth')

const router = Router()

router.get('/',                    ComicController.list)
router.get('/:slug',               ComicController.getBySlug)
router.post('/',    requireEditor, upload.single('cover'), ComicController.create)
router.put('/:id',  requireEditor, upload.single('cover'), ComicController.update)
router.delete('/:id', requireEditor, ComicController.remove)

router.post('/:id/pages',               requireEditor, upload.single('image'), ComicController.addPage)
router.delete('/:id/pages/:pageId',     requireEditor, ComicController.removePage)
router.put('/:id/pages/reorder',        requireEditor, ComicController.reorderPages)

module.exports = router
