// One-time migration: moves data from db.json + local /uploads into Turso + Cloudinary.
// Usage: node scripts/migrate-to-cloud.js
require('dotenv').config()

const fs = require('fs')
const path = require('path')
const { createTables, insertRow, count } = require('../src/data/sql')
const { uploadBuffer } = require('../src/utils/cloudinary')

const DB_JSON_PATH = path.join(__dirname, '../db.json')
const UPLOADS_DIR = path.join(__dirname, '../uploads')

function requireEnv(names) {
  const missing = names.filter(n => !process.env[n])
  if (missing.length) {
    console.error(`Faltan variables de entorno: ${missing.join(', ')}`)
    console.error('Configura backend/.env con tus credenciales de Turso y Cloudinary antes de migrar.')
    process.exit(1)
  }
}

// Extracts the filename from a local /uploads URL, e.g.
// "http://localhost:3001/uploads/foo.png" -> "foo.png"
function localFilename(url) {
  if (!url || !url.includes('/uploads/')) return null
  return url.split('/uploads/').pop()
}

async function uploadFileIfExists(filePath, folder) {
  if (!fs.existsSync(filePath)) {
    console.warn(`  archivo no encontrado, se omite: ${filePath}`)
    return null
  }
  const buffer = fs.readFileSync(filePath)
  return uploadBuffer(buffer, folder)
}

async function migrateCharacters(db) {
  console.log(`Migrando ${db.characters.length} personajes...`)
  for (const char of db.characters) {
    const data = { ...char }
    const filename = localFilename(data.image_url)
    if (filename) {
      const result = await uploadFileIfExists(path.join(UPLOADS_DIR, filename), 'yakutown/characters')
      data.image_url = result ? result.secure_url : ''
    }
    await insertRow('characters', data)
    console.log(`  ok: ${data.name}`)
  }
}

async function migrateFactions(db) {
  console.log(`Migrando ${db.factions.length} facciones...`)
  for (const faction of db.factions) {
    await insertRow('factions', faction)
  }
}

async function migratePhotos(db) {
  console.log(`Migrando ${db.photos.length} fotos...`)
  for (const photo of db.photos) {
    const data = {
      ...photo,
      event_ids: photo.event_ids || [],
      location_ids: photo.location_ids || [],
    }
    const filename = localFilename(data.url)
    if (filename) {
      const result = await uploadFileIfExists(path.join(UPLOADS_DIR, filename), 'yakutown/gallery')
      if (result) {
        data.url = result.secure_url
        data.cloudinary_id = result.public_id
      }
    }
    await insertRow('photos', data)
    console.log(`  ok: ${data.filename}`)
  }
}

async function migrateEvents(db) {
  console.log(`Migrando ${db.events.length} eventos...`)
  for (const event of db.events) {
    await insertRow('events', event)
  }
}

async function migrateLocations(db) {
  console.log(`Migrando ${db.locations.length} ubicaciones...`)
  for (const location of db.locations) {
    await insertRow('locations', location)
  }
}

async function migrateUsers(db) {
  console.log(`Migrando ${db.users.length} usuarios...`)
  for (const user of db.users) {
    await insertRow('users', user)
  }
}

async function main() {
  requireEnv([
    'TURSO_DATABASE_URL',
    'TURSO_AUTH_TOKEN',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ])

  if (!fs.existsSync(DB_JSON_PATH)) {
    console.error(`No se encontró ${DB_JSON_PATH}`)
    process.exit(1)
  }

  await createTables()

  const existing = await count('characters')
  if (existing > 0) {
    console.error(`La base de datos ya tiene ${existing} personajes. Migración abortada para evitar duplicados.`)
    process.exit(1)
  }

  const db = JSON.parse(fs.readFileSync(DB_JSON_PATH, 'utf-8'))

  await migrateFactions(db)
  await migrateCharacters(db)
  await migratePhotos(db)
  await migrateEvents(db)
  await migrateLocations(db)
  await migrateUsers(db)

  console.log('Migración completa.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
