const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMentorAdvice } = require('../controllers/mentorController');

router.post('/', auth, getMentorAdvice);

module.exports = router;
