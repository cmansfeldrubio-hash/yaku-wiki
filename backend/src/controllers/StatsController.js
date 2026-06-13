const StatsService = require('../services/StatsService')

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const StatsController = {
  get: wrap(async (req, res) => {
    res.json(await StatsService.get())
  }),
}

module.exports = StatsController
