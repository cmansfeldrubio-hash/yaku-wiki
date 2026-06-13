const { Router } = require('express')
const AuthController = require('../controllers/AuthController')
const { requireAuth } = require('../middleware/auth')

const router = Router()

router.post('/google', AuthController.google)
router.get('/me', requireAuth, AuthController.me)

module.exports = router
