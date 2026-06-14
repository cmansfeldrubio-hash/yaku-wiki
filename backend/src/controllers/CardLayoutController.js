const CardLayoutService = require('../services/CardLayoutService')

// Wraps async handlers so unhandled errors reach the error middleware
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const CardLayoutController = {
  get: wrap(async (req, res) => {
    res.json(await CardLayoutService.get())
  }),

  update: wrap(async (req, res) => {
    res.json(await CardLayoutService.update(req.body))
  }),
}

module.exports = CardLayoutController
