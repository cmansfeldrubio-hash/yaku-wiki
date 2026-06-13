const AuthService = require('../services/AuthService')

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next)

module.exports = {
  google: wrap(async (req, res) => {
    const { credential } = req.body
    const { token, user } = await AuthService.loginWithGoogle(credential)
    res.json({ token, user })
  }),

  me: wrap(async (req, res) => {
    const user = await AuthService.getCurrentUser(req.user.id)
    res.json({ user })
  }),
}
