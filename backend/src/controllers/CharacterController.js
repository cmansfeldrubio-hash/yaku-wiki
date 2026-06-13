const CharacterService = require('../services/CharacterService')

// Wraps async handlers so unhandled errors reach the error middleware
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const CharacterController = {
  list: wrap(async (req, res) => {
    const { faction, search } = req.query
    const result = await CharacterService.list({ faction, search })
    res.json(result)
  }),

  getOne: wrap(async (req, res) => {
    const char = await CharacterService.getById(req.params.id)
    res.json(char)
  }),

  getBySlug: wrap(async (req, res) => {
    const { slug } = req.params
    const char = await CharacterService.getBySlug(slug)
    res.json(char)
  }),

  create: wrap(async (req, res) => {
    const char = await CharacterService.create(req.body)
    res.status(201).json(char)
  }),

  update: wrap(async (req, res) => {
    const char = await CharacterService.update(req.params.id, req.body)
    res.json(char)
  }),

  patch: wrap(async (req, res) => {
    const char = await CharacterService.patch(req.params.id, req.body)
    res.json(char)
  }),

  remove: wrap(async (req, res) => {
    const result = await CharacterService.remove(req.params.id)
    res.json(result)
  }),

  uploadImage: wrap(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' })
    }
    const char = await CharacterService.setImage(req.params.id, req.file)
    res.json(char)
  }),
}

module.exports = CharacterController
