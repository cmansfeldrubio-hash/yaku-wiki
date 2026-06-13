const WikiIndexService = require('../services/WikiIndexService')

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const WikiIndexController = {
  get: wrap(async (req, res) => {
    res.json(await WikiIndexService.get())
  }),
}

module.exports = WikiIndexController
