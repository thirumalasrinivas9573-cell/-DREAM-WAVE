const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createRoadmap, getRoadmap, updateTaskStatus } = require('../controllers/roadmapController');

router.post('/generate', auth, createRoadmap);
router.get('/:goalId', auth, getRoadmap);
router.put('/:goalId/task', auth, updateTaskStatus);

module.exports = router;
