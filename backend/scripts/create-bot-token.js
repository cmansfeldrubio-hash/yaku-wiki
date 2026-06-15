// Creates (or reuses) a service account with role "editor" and prints a
// signed session token for it — used by lore-agent/ to authenticate against
// the API. The token expires after 30 days (JWT_EXPIRES_IN in utils/jwt.js);
// re-run this script to mint a new one.
//
// Usage: node scripts/create-bot-token.js [email] [name]
require('dotenv').config()

const { v4: uuidv4 } = require('uuid')
const db = require('../src/data/db')
const { signSession } = require('../src/utils/jwt')

async function main() {
  const email = process.argv[2] || 'lore-agent@yakutown.local'
  const name = process.argv[3] || 'Lore Agent'
  const googleId = `bot:${email}`

  let user = await db.getUserByGoogleId(googleId)
  if (!user) {
    const now = new Date().toISOString()
    user = await db.addUser({
      id: uuidv4(),
      google_id: googleId,
      email,
      name,
      picture: '',
      role: 'editor',
      created_at: now,
      updated_at: now,
    })
    console.error(`Usuario bot creado: ${email} (role: editor)`)
  } else {
    console.error(`Usuario bot existente: ${email} (role: ${user.role})`)
  }

  console.log(signSession(user))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
