const db = require('../data/db')
const { sanitizeUser } = require('./AuthService')

const VALID_ROLES = ['viewer', 'editor', 'admin']

async function list() {
  const users = await db.getUsers()
  return users.map(sanitizeUser)
}

async function updateRole(id, role) {
  if (!VALID_ROLES.includes(role)) {
    const err = new Error('Rol inválido')
    err.status = 400
    throw err
  }

  const user = await db.getUser(id)
  if (!user) {
    const err = new Error('Usuario no encontrado')
    err.status = 404
    throw err
  }

  const updated = await db.updateUser(id, { ...user, role, updated_at: new Date().toISOString() })
  return sanitizeUser(updated)
}

module.exports = { list, updateRole }
