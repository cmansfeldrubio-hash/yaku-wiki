// One-time cleanup: merges duplicate photo records that share the same `url`
// (caused by repeated "guardar etiquetado" clicks on entity-sourced images
// before createFromUrl was made idempotent), keeping one record per url with
// combined captions/tags.
// Usage: node scripts/dedupe-photos.js
require('dotenv').config()

const db = require('../src/data/db')
const { destroyAsset } = require('../src/utils/cloudinary')

function requireEnv(names) {
  const missing = names.filter(n => !process.env[n])
  if (missing.length) {
    console.error(`Faltan variables de entorno: ${missing.join(', ')}`)
    console.error('Configura backend/.env con tus credenciales de Turso antes de ejecutar este script.')
    process.exit(1)
  }
}

function mergeGroup(group) {
  // Prefer the record with a real cloudinary upload (if any) as the primary;
  // otherwise keep the oldest one.
  const sorted = [...group].sort((a, b) => {
    if (!!a.cloudinary_id !== !!b.cloudinary_id) return a.cloudinary_id ? -1 : 1
    return (a.uploaded_at || '').localeCompare(b.uploaded_at || '')
  })
  const [primary, ...rest] = sorted

  const caption = primary.caption || rest.find(p => p.caption)?.caption || ''
  const character_ids = [...new Set(group.flatMap(p => p.character_ids || []))]
  const event_ids     = [...new Set(group.flatMap(p => p.event_ids || []))]
  const location_ids  = [...new Set(group.flatMap(p => p.location_ids || []))]

  return {
    primary,
    rest,
    merged: { ...primary, caption, character_ids, event_ids, location_ids },
  }
}

async function main() {
  requireEnv(['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN'])

  const photos = await db.getPhotos()
  console.log(`Total de fotos: ${photos.length}`)

  const byUrl = new Map()
  for (const photo of photos) {
    const list = byUrl.get(photo.url) || []
    list.push(photo)
    byUrl.set(photo.url, list)
  }

  const duplicateGroups = [...byUrl.values()].filter(group => group.length > 1)
  console.log(`Grupos con duplicados: ${duplicateGroups.length}`)

  let removed = 0
  for (const group of duplicateGroups) {
    const { primary, rest, merged } = mergeGroup(group)
    console.log(`\nurl: ${primary.url}`)
    console.log(`  manteniendo: ${primary.id} (caption="${merged.caption}", tags: ${merged.character_ids.length}+${merged.event_ids.length}+${merged.location_ids.length})`)

    await db.updatePhoto(primary.id, merged)

    for (const dup of rest) {
      console.log(`  eliminando: ${dup.id}`)
      if (dup.cloudinary_id) await destroyAsset(dup.cloudinary_id)
      await db.removePhoto(dup.id)
      removed++
    }
  }

  console.log(`\nListo. ${removed} fotos duplicadas eliminadas.`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
