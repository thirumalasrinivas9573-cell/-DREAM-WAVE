const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  signup,
  login,
  aaidLogin,
  getMe,
  forgotPassword,
  resendOtp,
  verifyOtp,
  resetPassword,
  completeOnboarding,
  sendPhoneOtp,
  verifyPhoneOtp,
  registerVerified,
  portalInit,
  portalSendPhone,
  portalVerifyPhone,
  portalComplete,
  portalResendPhone,
  verifyLoginEmailOtp,
  refresh,
  logout,
  listSessions,
  revokeSession,
  revokeAllSessions,
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/register', signup);
router.post('/register-verified', registerVerified);
router.post('/login', login);
router.post('/aaid-login', aaidLogin);
router.get('/me', auth, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/resend-otp', resendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/onboarding', auth, completeOnboarding);

// Twilio Verify phone OTP (production)
router.post('/send-phone-otp', sendPhoneOtp);
router.post('/verify-phone-otp', verifyPhoneOtp);

// Portal multi-step registration (additive; phone via Twilio Verify)
router.post('/portal/init', portalInit);
router.post('/portal/send-phone', portalSendPhone);
router.post('/portal/verify-phone', portalVerifyPhone);
router.post('/portal/complete', portalComplete);
router.post('/portal/resend-phone', portalResendPhone);
router.post('/verify-login-email-otp', verifyLoginEmailOtp);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/sessions', auth, listSessions);
router.delete('/sessions/:id', auth, revokeSession);
router.delete('/sessions', auth, revokeAllSessions);

module.exports = router;
