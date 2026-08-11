const { AppError } = require('./errorHandler');

/**
 * Optional hard gate for email verification.
 * Enabled when REQUIRE_EMAIL_VERIFIED=true (or "1").
 * Skipped in NODE_ENV=test so smoke suites remain stable.
 */
function requireVerifiedEmail(req, _res, next) {
  if (process.env.NODE_ENV === 'test') return next();
  const required =
    process.env.REQUIRE_EMAIL_VERIFIED === 'true' || process.env.REQUIRE_EMAIL_VERIFIED === '1';
  if (!required) return next();
  if (!req.user?.isEmailVerified) {
    return next(new AppError('Email verification required. Check your inbox or use OTP verify.', 403));
  }
  return next();
}

module.exports = { requireVerifiedEmail };
