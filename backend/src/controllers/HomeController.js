const HomeService = require('../services/HomeService')

// Wraps async handlers so unhandled errors reach the error middleware
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const HomeController = {
  get: wrap(async (req, res) => {
    res.json(await HomeService.get())
  }),

  update: wrap(async (req, res) => {
    res.json(await HomeService.update(req.body))
  }),

  uploadImage: wrap(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' })
    }
    res.json(await HomeService.setImage(req.file))
  }),

  uploadAdImage: wrap(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' })
    }
    res.json(await HomeService.setAdImage(req.file))
  }),
}

module.exports = HomeController
