const router = require('express').Router();
const auth   = require('../middleware/auth');
const {
  register,
  login,
  loginAA,
  getMe
} = require('../controllers/authController');

router.post('/register',  register);
router.post('/login',     login);
router.post('/login-aa',  loginAA);
router.get('/me',         auth, getMe);

module.exports = router;
