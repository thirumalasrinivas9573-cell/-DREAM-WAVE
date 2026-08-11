const {
  listNotifications,
  markRead,
  markAllRead,
  getUnreadCount,
} = require('../services/platformNotificationService')

/** GET /api/platform-notifications */
exports.list = async (req, res) => {
  try {
    const result = await listNotifications(req.user._id, {
      page: req.query.page,
      limit: req.query.limit,
    })
    res.json({ success: true, notifications: result.items, pagination: result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/** GET /api/platform-notifications/unread-count */
exports.unreadCount = async (req, res) => {
  try {
    const count = await getUnreadCount(req.user._id)
    res.json({ success: true, count })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/** PATCH /api/platform-notifications/:id/read */
exports.markRead = async (req, res) => {
  try {
    const notification = await markRead(req.params.id, req.user._id)
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' })
    }
    res.json({ success: true, notification })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/** POST /api/platform-notifications/read-all */
exports.markAllRead = async (req, res) => {
  try {
    await markAllRead(req.user._id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
