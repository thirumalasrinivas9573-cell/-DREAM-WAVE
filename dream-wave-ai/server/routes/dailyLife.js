const router = require('express').Router();
const auth = require('../middleware/auth');
const { ask } = require('../controllers/dailyLifeController');
router.post('/', auth, ask);
module.exports = router;
