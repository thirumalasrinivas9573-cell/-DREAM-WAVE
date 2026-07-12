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
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/register', signup);
router.post('/login', login);
router.post('/aaid-login', aaidLogin);
router.get('/me', auth, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/resend-otp', resendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/onboarding', auth, completeOnboarding);

module.exports = router;
