/**
 * MJ API Key Middleware (architecture only — future enforcement)
 * @module mj/gateway/middleware/apiKey
 */

const { MJLogger } = require('../../logger')

/**
 * Validates API key when MJ_API_KEY env var is set.
 * When unset, passes through (development mode).
 */
function apiKeyMiddleware(req, res, next) {
  const configuredKey = process.env.MJ_API_KEY
  if (!configuredKey) return next()

  const providedKey = req.headers['x-mj-api-key'] || req.headers['authorization']?.replace(/^Bearer\s+/i, '')

  if (!providedKey || providedKey !== configuredKey) {
    MJLogger.child('Gateway:ApiKey').warning('Invalid API key attempt', {
      requestId: req.mjRequestId,
      ip: req.ip,
    })
    return res.status(401).json({
      success: false,
      timestamp: Date.now(),
      requestId: req.mjRequestId,
      executionTime: 0,
      mjState: null,
      payload: null,
      errors: [{ type: 'validation', code: 'MJ_GW_UNAUTHORIZED', message: 'Invalid or missing API key' }],
      warnings: [],
    })
  }

  next()
}

module.exports = { apiKeyMiddleware }
