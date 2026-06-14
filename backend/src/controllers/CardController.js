const CardService = require('../services/CardService')

// Wraps async handlers so unhandled errors reach the error middleware
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const CardController = {
  list: wrap(async (req, res) => {
    const cards = await CardService.list()
    res.json({ total: cards.length, cards })
  }),

  getById: wrap(async (req, res) => {
    res.json(await CardService.getById(req.params.id))
  }),

  create: wrap(async (req, res) => {
    const card = await CardService.create({ file: req.file, body: req.body, user: req.user })
    res.status(201).json(card)
  }),

  remove: wrap(async (req, res) => {
    res.json(await CardService.remove(req.params.id, req.user))
  }),
}

module.exports = CardController
