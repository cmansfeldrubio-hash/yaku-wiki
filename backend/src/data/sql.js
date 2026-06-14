const client = require('./turso')

// Columns that are stored as JSON-encoded text
const JSON_FIELDS = {
  characters:   ['tags', 'relaciones', 'sections', 'aliases'],
  events:       ['tags'],
  locations:    ['tags'],
  glossary:     ['tags'],
  photos:       ['character_ids', 'event_ids', 'location_ids'],
  memes:        ['character_ids', 'event_ids', 'location_ids', 'likes'],
  home_content: ['sections'],
}

// Columns that are stored as 0/1 integers
const BOOL_FIELDS = {
  characters: ['yakuma_title'],
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    name TEXT,
    aliases TEXT,
    origin TEXT,
    faction TEXT,
    status TEXT,
    yakuma_title INTEGER DEFAULT 0,
    tags TEXT,
    description TEXT,
    hito TEXT,
    poder TEXT,
    relaciones TEXT,
    sections TEXT,
    image_url TEXT,
    created_at TEXT,
    updated_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS factions (
    id TEXT PRIMARY KEY,
    label TEXT,
    color TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    filename TEXT,
    url TEXT,
    cloudinary_id TEXT,
    caption TEXT,
    character_ids TEXT,
    event_ids TEXT,
    location_ids TEXT,
    uploaded_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    name TEXT,
    description TEXT,
    date TEXT,
    location_id TEXT,
    tags TEXT,
    image_url TEXT,
    created_at TEXT,
    updated_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    name TEXT,
    description TEXT,
    type TEXT,
    tags TEXT,
    image_url TEXT,
    created_at TEXT,
    updated_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS glossary (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    name TEXT,
    description TEXT,
    tags TEXT,
    image_url TEXT,
    created_at TEXT,
    updated_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS memes (
    id TEXT PRIMARY KEY,
    filename TEXT,
    url TEXT,
    cloudinary_id TEXT,
    caption TEXT,
    character_ids TEXT,
    event_ids TEXT,
    location_ids TEXT,
    likes TEXT,
    uploaded_by TEXT,
    uploaded_by_name TEXT,
    uploaded_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    card_type TEXT,
    name TEXT,
    subtype TEXT,
    rarity TEXT,
    cost INTEGER,
    effect_text TEXT,
    character_id TEXT,
    source_image_url TEXT,
    rendered_url TEXT,
    rendered_cloudinary_id TEXT,
    created_by TEXT,
    created_by_name TEXT,
    created_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS home_content (
    id TEXT PRIMARY KEY,
    banner_image_url TEXT,
    sections TEXT,
    ad_image_url TEXT,
    ad_link_url TEXT,
    updated_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    google_id TEXT UNIQUE,
    email TEXT,
    name TEXT,
    picture TEXT,
    role TEXT,
    created_at TEXT,
    updated_at TEXT
  )`,
]

// Columns added after the initial table creation — applied with
// ALTER TABLE for databases created before the column existed.
const COLUMN_MIGRATIONS = [
  { table: 'glossary', column: 'image_url', type: 'TEXT' },
  { table: 'home_content', column: 'ad_image_url', type: 'TEXT' },
  { table: 'home_content', column: 'ad_link_url', type: 'TEXT' },
]

async function createTables() {
  for (const sql of SCHEMA) {
    await client.execute(sql)
  }
  for (const { table, column, type } of COLUMN_MIGRATIONS) {
    try {
      await client.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`)
    } catch (err) {
      if (!/duplicate column/i.test(err.message || '')) throw err
    }
  }
}

function decodeRow(table, row) {
  if (!row) return null
  const obj = {}
  for (const key of Object.keys(row)) obj[key] = row[key]
  for (const f of JSON_FIELDS[table] || []) {
    obj[f] = obj[f] ? JSON.parse(obj[f]) : []
  }
  for (const f of BOOL_FIELDS[table] || []) {
    obj[f] = !!obj[f]
  }
  return obj
}

function encodeRow(table, obj) {
  const out = { ...obj }
  for (const f of JSON_FIELDS[table] || []) {
    out[f] = JSON.stringify(out[f] || [])
  }
  for (const f of BOOL_FIELDS[table] || []) {
    out[f] = out[f] ? 1 : 0
  }
  return out
}

async function findAll(table) {
  const res = await client.execute(`SELECT * FROM ${table}`)
  return res.rows.map(r => decodeRow(table, r))
}

async function findById(table, id) {
  const res = await client.execute({ sql: `SELECT * FROM ${table} WHERE id = :id`, args: { id } })
  return decodeRow(table, res.rows[0])
}

async function findOneBy(table, column, value) {
  const res = await client.execute({ sql: `SELECT * FROM ${table} WHERE ${column} = :value`, args: { value } })
  return decodeRow(table, res.rows[0])
}

async function count(table) {
  const res = await client.execute(`SELECT COUNT(*) as count FROM ${table}`)
  return Number(res.rows[0].count)
}

async function insertRow(table, obj) {
  const row = encodeRow(table, obj)
  const cols = Object.keys(row)
  const placeholders = cols.map(c => `:${c}`)
  await client.execute({
    sql: `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders.join(', ')})`,
    args: row,
  })
  return obj
}

async function updateRow(table, id, obj) {
  const row = encodeRow(table, obj)
  const cols = Object.keys(row).filter(c => c !== 'id')
  const setClause = cols.map(c => `${c} = :${c}`).join(', ')
  await client.execute({
    sql: `UPDATE ${table} SET ${setClause} WHERE id = :id`,
    args: { ...row, id },
  })
  return obj
}

async function deleteRow(table, id) {
  const existing = await findById(table, id)
  if (!existing) return null
  await client.execute({ sql: `DELETE FROM ${table} WHERE id = :id`, args: { id } })
  return existing
}

module.exports = {
  client,
  SCHEMA,
  createTables,
  decodeRow,
  encodeRow,
  findAll,
  findById,
  findOneBy,
  count,
  insertRow,
  updateRow,
  deleteRow,
}
