const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getTasks,
  createTask,
  completeTask,
  generateTask,
} = require('../controllers/taskController');

router.get('/', auth, getTasks);
router.post('/', auth, createTask);
router.post('/:id/complete', auth, completeTask);
router.post('/generate', auth, generateTask);

module.exports = router;
