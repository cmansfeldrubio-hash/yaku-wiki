const { verifySession } = require('../utils/jwt')
const db = require('../data/db')

// Parses the Authorization header and attaches req.user if the session is valid.
// Never blocks the request — routes decide whether auth is required.
async function attachUser(req, res, next) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme === 'Bearer' && token) {
    const payload = verifySession(token)
    if (payload) {
      try {
        const user = await db.getUser(payload.sub)
        if (user) req.user = user
      } catch {
        // ignore — treat as unauthenticated
      }
    }
  }

  next()
}

// Requires a logged-in user (any role)
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Inicia sesión para realizar esta acción' })
  }
  next()
}

// Requires a logged-in user with permission to edit (role 'editor', 'admin' or 'owner')
function requireEditor(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Inicia sesión para realizar esta acción' })
  }
  if (!['editor', 'admin', 'owner'].includes(req.user.role)) {
    return res.status(403).json({ error: 'No tienes permisos de edición' })
  }
  next()
}

// Requires a logged-in user with the 'owner' role (manages other users' permissions)
function requireOwner(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Inicia sesión para realizar esta acción' })
  }
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Solo el propietario puede gestionar permisos' })
  }
  next()
}

module.exports = { attachUser, requireAuth, requireEditor, requireOwner }
