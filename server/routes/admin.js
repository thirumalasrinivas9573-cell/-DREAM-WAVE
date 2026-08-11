const express = require('express')
const router  = express.Router()
const auth    = require('../middleware/auth')
const requireRole = require('../middleware/requireRole')
const { getStats } = require('../controllers/analyticsController')

router.get('/stats', auth, requireRole('admin'), getStats)

module.exports = router
