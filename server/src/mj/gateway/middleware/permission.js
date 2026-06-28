/**
 * MJ Permission Middleware (architecture only — future RBAC/JWT)
 * @module mj/gateway/middleware/permission
 */

const { MJLogger } = require('../../logger')

/**
 * Attaches permission context for future RBAC enforcement.
 * Does NOT modify Dream Wave auth middleware.
 */
function permissionMiddleware(req, res, next) {
  req.mjPermissions = {
    authenticated: false,
    userId: req.body?.userId || req.headers['x-user-id'] || null,
    roles: [],
    capabilities: [],
    jwtReady: false,
    rbacReady: false,
  }

  // Future: validate JWT from Authorization header without touching Dream Wave auth
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    req.mjPermissions.jwtReady = true
    // Architecture stub — decode JWT in future sprint
  }

  MJLogger.child('Gateway:Permission').debug('Permission context attached', {
    requestId: req.mjRequestId,
    userId: req.mjPermissions.userId,
  })

  next()
}

module.exports = { permissionMiddleware }
