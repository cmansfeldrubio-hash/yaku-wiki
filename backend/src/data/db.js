const { v4: uuidv4 } = require('uuid')
const { SEED_CHARACTERS, SEED_FACTIONS } = require('./seed')
const {
  createTables,
  findAll,
  findById,
  findOneBy,
  insertRow,
  updateRow,
  deleteRow,
  count,
} = require('./sql')

// Stamps ids and timestamps onto raw seed entries
function stampCharacter(raw) {
  const now = new Date().toISOString()
  return {
    ...raw,
    id:         uuidv4(),
    created_at: now,
    updated_at: now,
    sections:   raw.sections || [],
  }
}

let readyPromise = null

async function init() {
  await createTables()

  if (await count('characters') === 0) {
    for (const raw of SEED_CHARACTERS) {
      await insertRow('characters', stampCharacter(raw))
    }
    for (const faction of SEED_FACTIONS) {
      await insertRow('factions', faction)
    }
  }
}

function ready() {
  if (!readyPromise) readyPromise = init()
  return readyPromise
}

const db = {
  // Characters
  getCharacters:   async ()         => { await ready(); return findAll('characters') },
  getCharacter:    async (id)       => { await ready(); return findById('characters', id) },
  addCharacter:    async (char)     => { await ready(); return insertRow('characters', char) },
  updateCharacter: async (id, data) => { await ready(); return updateRow('characters', id, data) },
  removeCharacter: async (id)       => { await ready(); return deleteRow('characters', id) },

  // Factions
  getFactions: async ()       => { await ready(); return findAll('factions') },
  getFaction:  async (id)     => { await ready(); return findOneBy('factions', 'id', id) },
  addFaction:  async (faction)=> { await ready(); return insertRow('factions', faction) },

  // Photos
  getPhotos:   async ()         => { await ready(); return findAll('photos') },
  getPhoto:    async (id)       => { await ready(); return findById('photos', id) },
  addPhoto:    async (photo)    => { await ready(); return insertRow('photos', photo) },
  updatePhoto: async (id, data) => { await ready(); return updateRow('photos', id, data) },
  removePhoto: async (id)       => { await ready(); return deleteRow('photos', id) },

  // Memes
  getMemes:   async ()         => { await ready(); return findAll('memes') },
  getMeme:    async (id)       => { await ready(); return findById('memes', id) },
  addMeme:    async (meme)     => { await ready(); return insertRow('memes', meme) },
  updateMeme: async (id, data) => { await ready(); return updateRow('memes', id, data) },
  removeMeme: async (id)       => { await ready(); return deleteRow('memes', id) },

  // Cards
  getCards:   async ()         => { await ready(); return findAll('cards') },
  getCard:    async (id)       => { await ready(); return findById('cards', id) },
  addCard:    async (card)     => { await ready(); return insertRow('cards', card) },
  removeCard: async (id)       => { await ready(); return deleteRow('cards', id) },

  // Users
  getUsers:          async ()         => { await ready(); return findAll('users') },
  getUser:           async (id)       => { await ready(); return findById('users', id) },
  getUserByGoogleId: async (googleId) => { await ready(); return findOneBy('users', 'google_id', googleId) },
  addUser:           async (user)     => { await ready(); return insertRow('users', user) },
  updateUser:        async (id, data) => { await ready(); return updateRow('users', id, data) },

  // Generic collections (events, locations)
  getCollection:        async (name)        => { await ready(); return findAll(name) },
  getFromCollection:    async (name, id)    => { await ready(); return findById(name, id) },
  addToCollection:      async (name, item)  => { await ready(); return insertRow(name, item) },
  updateInCollection:   async (name, id, data) => { await ready(); return updateRow(name, id, data) },
  removeFromCollection: async (name, id)    => { await ready(); return deleteRow(name, id) },

  // Home content (singleton row)
  getHomeContent: async ()     => { await ready(); return findById('home_content', 'home') },
  setHomeContent: async (data) => {
    await ready()
    const existing = await findById('home_content', 'home')
    if (existing) return updateRow('home_content', 'home', data)
    return insertRow('home_content', { ...data, id: 'home' })
  },

  // Comics
  getComics:   async ()         => { await ready(); return findAll('comics') },
  getComic:    async (id)       => { await ready(); return findById('comics', id) },
  addComic:    async (comic)    => { await ready(); return insertRow('comics', comic) },
  updateComic: async (id, data) => { await ready(); return updateRow('comics', id, data) },
  removeComic: async (id)       => { await ready(); return deleteRow('comics', id) },

  // Comic pages (raw client needed for WHERE queries)
  getComicPages: async (comicId) => {
    await ready()
    const { client } = require('./sql')
    const res = await client.execute({
      sql: 'SELECT * FROM comic_pages WHERE comic_id = :comicId ORDER BY page_number ASC',
      args: { comicId },
    })
    return res.rows.map(r => ({ id: r.id, comic_id: r.comic_id, page_number: Number(r.page_number), image_url: r.image_url, cloudinary_id: r.cloudinary_id, uploaded_at: r.uploaded_at }))
  },
  addComicPage:    async (page)     => { await ready(); return insertRow('comic_pages', page) },
  removeComicPage: async (id)       => { await ready(); return deleteRow('comic_pages', id) },
  getComicPage:    async (id)       => { await ready(); return findById('comic_pages', id) },
  updateComicPagesOrder: async (pages) => {
    await ready()
    const { client } = require('./sql')
    for (const { id, page_number } of pages) {
      await client.execute({ sql: 'UPDATE comic_pages SET page_number = :n WHERE id = :id', args: { n: page_number, id } })
    }
  },

  // Card layout overrides (singleton row, shared globally except the image box)
  getCardLayout: async ()     => { await ready(); return findById('card_layout', 'layout') },
  setCardLayout: async (data) => {
    await ready()
    const existing = await findById('card_layout', 'layout')
    if (existing) return updateRow('card_layout', 'layout', data)
    return insertRow('card_layout', { ...data, id: 'layout' })
  },
}

module.exports = db
