const FactionService = require('../services/FactionService')

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const FactionController = {
  list: wrap(async (req, res) => {
    res.json(await FactionService.list())
  }),

  create: wrap(async (req, res) => {
    const faction = await FactionService.create(req.body)
    res.status(201).json(faction)
  }),
}

module.exports = FactionController
