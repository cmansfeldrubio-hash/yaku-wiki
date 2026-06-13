const { Router } = require('express')
const UserController = require('../controllers/UserController')
const { requireOwner } = require('../middleware/auth')

const router = Router()

router.get('/', requireOwner, UserController.list)
router.patch('/:id/role', requireOwner, UserController.updateRole)

module.exports = router
