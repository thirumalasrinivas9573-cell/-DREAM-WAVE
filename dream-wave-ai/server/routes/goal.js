const router = require('express').Router();
const auth   = require('../middleware/auth');
const {
  startChat,
  continueChat,
  saveGoal,
  getHistory,
  updateGoal,
  deleteGoal
} = require('../controllers/goalController');

router.post('/start',    auth, startChat);
router.post('/continue', auth, continueChat);
router.post('/save',     auth, saveGoal);
router.get('/history',   auth, getHistory);
router.patch('/:id',     auth, updateGoal);
router.delete('/:id',    auth, deleteGoal);

module.exports = router;
