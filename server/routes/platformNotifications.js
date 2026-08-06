const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const requireRole = require('../middleware/requireRole')
const platformNotificationController = require('../controllers/platformNotificationController')

router.use(auth, requireRole('institution', 'company', 'student'))

router.get('/', platformNotificationController.list)
router.get('/unread-count', platformNotificationController.unreadCount)
router.post('/read-all', platformNotificationController.markAllRead)
router.patch('/:id/read', platformNotificationController.markRead)

module.exports = router
