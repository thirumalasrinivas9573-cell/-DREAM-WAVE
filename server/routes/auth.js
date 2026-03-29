const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  signup,
  login,
  aaidLogin,
  getMe,
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/aaid-login', aaidLogin);
router.get('/me', auth, getMe);

module.exports = router;
