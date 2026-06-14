const MemeService = require('../services/MemeService')

// Wraps async handlers so unhandled errors reach the error middleware
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const MemeController = {
  list: wrap(async (req, res) => {
    const memes = await MemeService.list(req.user?.id)
    res.json({ total: memes.length, memes })
  }),

  create: wrap(async (req, res) => {
    const meme = await MemeService.create({ file: req.file, body: req.body, user: req.user })
    res.status(201).json(meme)
  }),

  toggleLike: wrap(async (req, res) => {
    res.json(await MemeService.toggleLike(req.params.id, req.user.id))
  }),

  update: wrap(async (req, res) => {
    res.json(await MemeService.update(req.params.id, req.body, req.user))
  }),

  remove: wrap(async (req, res) => {
    res.json(await MemeService.remove(req.params.id, req.user))
  }),
}

module.exports = MemeController
