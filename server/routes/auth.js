const express = require('express');
const auth = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { zodValidate } = require('../middleware/validate');
const { uploadImage } = require('../middleware/upload');
const { requireTrustedOrigin } = require('../middleware/security');
const schemas = require('../config/schemas');

const router = express.Router();

router.post('/signup', zodValidate(schemas.signup), auth.signup);
router.post('/login', zodValidate(schemas.login), auth.login);
router.post('/refresh', requireTrustedOrigin, auth.refresh);
router.post('/forgot-password', zodValidate(schemas.forgotPassword), auth.forgotPassword);
router.put('/reset-password/:token', zodValidate(schemas.resetPassword), auth.resetPassword);
router.get('/verify-email/:token', auth.verifyEmail);

router.post('/logout', requireTrustedOrigin, auth.logout);
router.get('/me', protect, auth.getMe);
router.get('/sessions', protect, auth.sessions);
router.delete('/sessions/:id', protect, auth.revokeSession);
router.post('/resend-verification', protect, auth.resendVerification);
router.post('/otp/send', protect, auth.sendEmailOtp);
router.post('/otp/verify', protect, zodValidate(schemas.otpVerify), auth.verifyEmailOtp);
router.put('/profile', protect, uploadImage.single('avatar'), zodValidate(schemas.updateProfile), auth.updateProfile);
router.put('/change-password', protect, zodValidate(schemas.changePassword), auth.changePassword);
router.put('/preferences', protect, zodValidate(schemas.preferences), auth.updatePreferences);

module.exports = router;
