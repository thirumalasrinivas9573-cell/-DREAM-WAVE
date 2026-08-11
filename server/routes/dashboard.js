const express = require('express');
const ctrl = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { requireVerifiedEmail } = require('../middleware/requireVerifiedEmail');

const router = express.Router();
router.use(protect);
router.get('/stats', ctrl.getStats);
router.get('/progress', ctrl.getProgress);
router.get('/suggestions', requireVerifiedEmail, ctrl.getSuggestions);
router.get('/notifications', ctrl.getNotifications);
router.patch('/notifications/read-all', ctrl.markAllRead);
router.delete('/notifications/read', ctrl.clearReadNotifications);
router.patch('/notifications/:id/read', ctrl.markRead);
router.delete('/notifications/:id', ctrl.removeNotification);

module.exports = router;
