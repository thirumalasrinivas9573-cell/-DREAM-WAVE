const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isSessionFamilyActive } = require('../utils/tokenService');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, code: 'AUTH_REQUIRED', message: 'Authentication required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'dream-wave-api',
      audience: 'dream-wave-client',
    });
    if (decoded.type !== 'access' || !decoded.sid) {
      return res.status(401).json({ success: false, code: 'SESSION_INVALID', message: 'Session expired. Please sign in again.' });
    }
    if (!await isSessionFamilyActive(decoded.id, decoded.sid)) {
      return res.status(401).json({ success: false, code: 'SESSION_REVOKED', message: 'Session has been revoked.' });
    }
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ success: false, code: 'TOKEN_INVALID', message: 'Session is not valid.' });
    }

    if (user.suspended) {
      return res.status(403).json({ success: false, code: 'ACCOUNT_SUSPENDED', message: 'Account suspended. Contact support.' });
    }

    req.user = user;
    next();
  } catch (error) {
    const expired = error?.name === 'TokenExpiredError';
    res.status(401).json({
      success: false,
      code: expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
      message: expired ? 'Session expired. Please sign in again.' : 'Session is not valid.',
    });
  }
};

module.exports = auth;
