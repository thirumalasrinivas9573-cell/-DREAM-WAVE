const PartnershipActivity = require('../models/PartnershipActivity')
const PlatformNotification = require('../models/PlatformNotification')
const User = require('../models/User')
const Institution = require('../models/Institution')
const Company = require('../models/Company')

async function recordActivity({
  partnershipId,
  institutionId,
  companyId,
  type,
  title,
  description = '',
  actorUserId = null,
  actorRole = 'system',
  metadata = {},
}) {
  return PartnershipActivity.create({
    partnershipId,
    institutionId,
    companyId,
    type,
    title,
    description,
    actorUserId,
    actorRole,
    metadata,
  })
}

async function notifyUser({
  recipientUserId,
  recipientRole,
  type,
  title,
  body = '',
  partnershipId = null,
  metadata = {},
  io = null,
}) {
  const notification = await PlatformNotification.create({
    recipientUserId,
    recipientRole,
    type,
    title,
    body,
    partnershipId,
    metadata,
  })

  if (io) {
    io.to(`user:${recipientUserId}`).emit('platform:notification', {
      id: notification._id,
      type,
      title,
      body,
      partnershipId,
      createdAt: notification.createdAt,
    })
  }

  return notification
}

async function notifyOrgCounterparty({
  partnership,
  type,
  title,
  body,
  initiatorRole,
  io = null,
}) {
  const targetRole = initiatorRole === 'institution' ? 'company' : 'institution'
  let recipientUserId = null

  if (targetRole === 'company') {
    const company = await Company.findById(partnership.companyId).select('ownerUserId')
    recipientUserId = company?.ownerUserId
  } else {
    const institution = await Institution.findById(partnership.institutionId).select('ownerUserId')
    recipientUserId = institution?.ownerUserId
  }

  if (!recipientUserId) return null

  return notifyUser({
    recipientUserId,
    recipientRole: targetRole,
    type,
    title,
    body,
    partnershipId: partnership._id,
    metadata: { partnershipId: partnership._id },
    io,
  })
}

async function getUnreadCount(userId) {
  return PlatformNotification.countDocuments({ recipientUserId: userId, read: false })
}

async function listNotifications(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    PlatformNotification.find({ recipientUserId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PlatformNotification.countDocuments({ recipientUserId: userId }),
  ])
  return { items, total, page, limit, pageCount: Math.ceil(total / limit) || 1 }
}

async function markRead(notificationId, userId) {
  return PlatformNotification.findOneAndUpdate(
    { _id: notificationId, recipientUserId: userId },
    { read: true },
    { new: true },
  )
}

async function markAllRead(userId) {
  return PlatformNotification.updateMany(
    { recipientUserId: userId, read: false },
    { read: true },
  )
}

module.exports = {
  recordActivity,
  notifyUser,
  notifyOrgCounterparty,
  getUnreadCount,
  listNotifications,
  markRead,
  markAllRead,
}
