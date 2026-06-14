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
}

module.exports = db
