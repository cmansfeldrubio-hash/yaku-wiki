require('dotenv').config()

const express      = require('express')
const cors         = require('cors')
const errorHandler = require('./middleware/errorHandler')
const { attachUser } = require('./middleware/auth')

const characterRoutes = require('./routes/characters')
const factionRoutes   = require('./routes/factions')
const statsRoutes     = require('./routes/stats')
const photoRoutes     = require('./routes/photos')
const memeRoutes      = require('./routes/memes')
const eventRoutes     = require('./routes/events')
const locationRoutes  = require('./routes/locations')
const glossaryRoutes  = require('./routes/glossary')
const authRoutes      = require('./routes/auth')
const userRoutes      = require('./routes/users')
const wikiIndexRoutes = require('./routes/wikiIndex')
const homeRoutes      = require('./routes/home')
const cardRoutes      = require('./routes/cards')
const cardLayoutRoutes = require('./routes/cardLayout')

const app = express()

// --- Global middleware ---
app.use(cors())
app.use(express.json())
app.use(attachUser)

// --- API routes ---
app.use('/api/characters', characterRoutes)
app.use('/api/factions',   factionRoutes)
app.use('/api/stats',      statsRoutes)
app.use('/api/photos',     photoRoutes)
app.use('/api/memes',      memeRoutes)
app.use('/api/events',     eventRoutes)
app.use('/api/locations',  locationRoutes)
app.use('/api/glosario',   glossaryRoutes)
app.use('/api/auth',       authRoutes)
app.use('/api/users',      userRoutes)
app.use('/api/wiki-index', wikiIndexRoutes)
app.use('/api/home',       homeRoutes)
app.use('/api/cards',      cardRoutes)
app.use('/api/card-layout', cardLayoutRoutes)

// --- Error handler (must be last) ---
app.use(errorHandler)

module.exports = app
