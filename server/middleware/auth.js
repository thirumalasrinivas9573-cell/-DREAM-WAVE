const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorHandler');
const asyncHandler = require('../utils/asyncHandler');

exports.protect = asyncHandler(async (req, _res, next) => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new AppError('Server auth misconfigured', 500);
  }

  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) throw new AppError('Not authorized. Please log in.', 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new AppError('Token expired', 401);
    throw new AppError('Invalid token', 401);
  }

  if (decoded.type && decoded.type !== 'access') {
    throw new AppError('Invalid access token', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('User no longer exists.', 401);
  if (user.isActive === false) throw new AppError('Account is disabled.', 403);
  if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
    throw new AppError('Password recently changed. Please log in again.', 401);
  }

  req.user = user;
  next();
});

exports.authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Forbidden. Insufficient permissions.', 403));
  }
  next();
};

/** Require user to belong to an organization (tenant isolation gate). */
exports.requireOrganization = asyncHandler(async (req, _res, next) => {
  if (!req.user?.organizationId) {
    throw new AppError('Organization context required', 403);
  }
  next();
});
