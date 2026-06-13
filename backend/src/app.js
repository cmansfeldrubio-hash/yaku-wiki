require('dotenv').config()

const express      = require('express')
const cors         = require('cors')
const errorHandler = require('./middleware/errorHandler')
const { attachUser } = require('./middleware/auth')

const characterRoutes = require('./routes/characters')
const factionRoutes   = require('./routes/factions')
const statsRoutes     = require('./routes/stats')
const photoRoutes     = require('./routes/photos')
const eventRoutes     = require('./routes/events')
const locationRoutes  = require('./routes/locations')
const authRoutes      = require('./routes/auth')
const userRoutes      = require('./routes/users')

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
app.use('/api/events',     eventRoutes)
app.use('/api/locations',  locationRoutes)
app.use('/api/auth',       authRoutes)
app.use('/api/users',      userRoutes)

// --- Error handler (must be last) ---
app.use(errorHandler)

module.exports = app
