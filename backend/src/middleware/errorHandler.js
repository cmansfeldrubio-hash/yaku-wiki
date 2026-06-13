// Catches errors thrown by services/controllers and sends consistent JSON responses

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status  = err.status || 500
  const message = err.message || 'Error interno del servidor'

  if (status === 500) {
    console.error('[error]', err)
  }

  res.status(status).json({ error: message })
}

module.exports = errorHandler
