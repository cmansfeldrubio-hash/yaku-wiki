// Generic controller factory for simple top-level collections (events, locations).

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

function createEntityController(service) {
  return {
    list: wrap(async (req, res) => {
      const { search } = req.query
      res.json(await service.list({ search }))
    }),

    getOne: wrap(async (req, res) => {
      res.json(await service.getById(req.params.id))
    }),

    getBySlug: wrap(async (req, res) => {
      res.json(await service.getBySlug(req.params.slug))
    }),

    create: wrap(async (req, res) => {
      res.status(201).json(await service.create(req.body))
    }),

    update: wrap(async (req, res) => {
      res.json(await service.update(req.params.id, req.body))
    }),

    remove: wrap(async (req, res) => {
      res.json(await service.remove(req.params.id))
    }),

    uploadImage: wrap(async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No se recibió ningún archivo' })
      }
      res.json(await service.setImage(req.params.id, req.file))
    }),
  }
}

module.exports = createEntityController
