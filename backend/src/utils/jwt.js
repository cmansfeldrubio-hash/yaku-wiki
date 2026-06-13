const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'yakutown-dev-secret'
const JWT_EXPIRES_IN = '30d'

function signSession(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

function verifySession(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

module.exports = { signSession, verifySession }
