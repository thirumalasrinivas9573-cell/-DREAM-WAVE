const router = require('express').Router();
const auth   = require('../middleware/auth');
const {
  startChat,
  continueChat,
  saveGoal,
  getHistory
} = require('../controllers/goalController');

router.post('/start',    auth, startChat);
router.post('/continue', auth, continueChat);
router.post('/save',     auth, saveGoal);
router.get('/history',   auth, getHistory);

module.exports = router;
