const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { generateRoadmap } = require('../controllers/roadmapController');

router.post('/', auth, generateRoadmap);

module.exports = router;
