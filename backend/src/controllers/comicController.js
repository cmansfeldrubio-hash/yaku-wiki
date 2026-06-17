const ComicService = require('../services/ComicService')

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const ComicController = {
  list: wrap(async (req, res) => {
    const comics = await ComicService.list()
    res.json({ total: comics.length, comics })
  }),

  getBySlug: wrap(async (req, res) => {
    const comic = await ComicService.getBySlug(req.params.slug)
    res.json(comic)
  }),

  create: wrap(async (req, res) => {
    const comic = await ComicService.create({ file: req.file, body: req.body })
    res.status(201).json(comic)
  }),

  update: wrap(async (req, res) => {
    const comic = await ComicService.update(req.params.id, { file: req.file, body: req.body })
    res.json(comic)
  }),

  remove: wrap(async (req, res) => {
    const result = await ComicService.remove(req.params.id)
    res.json(result)
  }),

  addPage: wrap(async (req, res) => {
    const page = await ComicService.addPage(req.params.id, req.file)
    res.status(201).json(page)
  }),

  removePage: wrap(async (req, res) => {
    const result = await ComicService.removePage(req.params.id, req.params.pageId)
    res.json(result)
  }),

  reorderPages: wrap(async (req, res) => {
    const pages = await ComicService.reorderPages(req.params.id, req.body.order)
    res.json({ pages })
  }),
}

module.exports = ComicController
