const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createGoal,
  getGoals,
  getGoal,
} = require('../controllers/goalController');

router.post('/', auth, createGoal);
router.get('/', auth, getGoals);
router.get('/:id', auth, getGoal);

module.exports = router;
