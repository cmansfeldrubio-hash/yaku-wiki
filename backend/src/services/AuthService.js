const { OAuth2Client } = require('google-auth-library')
const { v4: uuidv4 } = require('uuid')
const db = require('../data/db')
const { signSession } = require('../utils/jwt')

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const client = new OAuth2Client(GOOGLE_CLIENT_ID)

function sanitizeUser(user) {
  return {
    id:      user.id,
    email:   user.email,
    name:    user.name,
    picture: user.picture,
    role:    user.role,
  }
}

async function loginWithGoogle(credential) {
  if (!GOOGLE_CLIENT_ID) {
    const err = new Error('El servidor no tiene configurado GOOGLE_CLIENT_ID')
    err.status = 500
    throw err
  }
  if (!credential) {
    const err = new Error('Falta el credential de Google')
    err.status = 400
    throw err
  }

  let payload
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID })
    payload = ticket.getPayload()
  } catch {
    const err = new Error('Token de Google inválido')
    err.status = 401
    throw err
  }

  const googleId = payload.sub
  let user = await db.getUserByGoogleId(googleId)

  if (!user) {
    const isFirstUser = (await db.getUsers()).length === 0
    const now = new Date().toISOString()
    user = await db.addUser({
      id:         uuidv4(),
      google_id:  googleId,
      email:      payload.email,
      name:       payload.name,
      picture:    payload.picture,
      role:       isFirstUser ? 'owner' : 'viewer',
      created_at: now,
      updated_at: now,
    })
  }

  const token = signSession(user)
  return { token, user: sanitizeUser(user) }
}

async function getCurrentUser(userId) {
  const user = await db.getUser(userId)
  if (!user) {
    const err = new Error('Usuario no encontrado')
    err.status = 404
    throw err
  }
  return sanitizeUser(user)
}

module.exports = { loginWithGoogle, getCurrentUser, sanitizeUser }
