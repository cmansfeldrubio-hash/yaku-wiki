const UserService = require('../services/UserService')

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next)

module.exports = {
  list: wrap(async (req, res) => {
    res.json({ users: await UserService.list() })
  }),

  updateRole: wrap(async (req, res) => {
    const user = await UserService.updateRole(req.params.id, req.body.role)
    res.json({ user })
  }),
}
