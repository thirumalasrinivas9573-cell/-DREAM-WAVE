const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDailyAdvice } = require('../controllers/dailyController');

router.post('/', auth, getDailyAdvice);

module.exports = router;
