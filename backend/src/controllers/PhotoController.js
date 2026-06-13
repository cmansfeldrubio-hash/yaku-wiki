const PhotoService = require('../services/PhotoService')

// Wraps async handlers so unhandled errors reach the error middleware
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const PhotoController = {
  list: wrap(async (req, res) => {
    const { characterId, eventId, locationId } = req.query
    const photos = await PhotoService.list({ characterId, eventId, locationId })
    res.json({ total: photos.length, photos })
  }),

  create: wrap(async (req, res) => {
    const photo = await PhotoService.create({ file: req.file, body: req.body })
    res.status(201).json(photo)
  }),

  update: wrap(async (req, res) => {
    const photo = await PhotoService.update(req.params.id, req.body)
    res.json(photo)
  }),

  remove: wrap(async (req, res) => {
    const result = await PhotoService.remove(req.params.id)
    res.json(result)
  }),
}

module.exports = PhotoController
