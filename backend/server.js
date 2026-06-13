const app = require('./src/app')
const db  = require('./src/data/db')

const PORT = process.env.PORT || 3001

app.listen(PORT, async () => {
  const chars    = await db.getCharacters()
  const factions = await db.getFactions()

  console.log(`\n🏙️  Yakutown API corriendo en http://localhost:${PORT}`)
  console.log(`📖  ${chars.length} personajes · ${factions.length} facciones`)
  console.log(`\n  GET    /api/characters`)
  console.log(`  GET    /api/characters/:id`)
  console.log(`  POST   /api/characters`)
  console.log(`  PUT    /api/characters/:id`)
  console.log(`  PATCH  /api/characters/:id`)
  console.log(`  DELETE /api/characters/:id`)
  console.log(`  POST   /api/characters/:id/image`)
  console.log(`  GET    /api/factions`)
  console.log(`  POST   /api/factions`)
  console.log(`  GET    /api/stats\n`)
})
