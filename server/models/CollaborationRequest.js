const mongoose = require('mongoose')
<<<<<<< HEAD

const collaborationRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: String, default: '' },
    projectTitle: { type: String, default: '', maxlength: 200 },
    roleNeeded: { type: String, default: '', maxlength: 120 },
    skillsNeeded: [{ type: String, trim: true, maxlength: 60 }],
    description: { type: String, required: true, maxlength: 2000 },
    topics: [{ type: String, trim: true, maxlength: 60 }],
    status: { type: String, enum: ['OPEN', 'PAUSED', 'CLOSED'], default: 'OPEN', index: true },
    visibility: { type: String, enum: ['PUBLIC', 'FOLLOWERS', 'PRIVATE'], default: 'PUBLIC', index: true },
=======
const { COLLABORATION_STATUSES } = require('../constants/community')

const collaborationRequestSchema = new mongoose.Schema(
  {
    requesterUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    linkedEntityType: { type: String, default: '' },
    linkedEntityId: { type: String, default: '' },
    message: { type: String, trim: true, default: '', maxlength: 500 },
    status: {
      type: String,
      enum: COLLABORATION_STATUSES,
      default: 'pending',
      index: true,
    },
    respondedAt: { type: Date, default: null },
>>>>>>> feature/ui-threejs
  },
  { timestamps: true },
)

<<<<<<< HEAD
collaborationRequestSchema.index({ status: 1, visibility: 1, createdAt: -1 })
collaborationRequestSchema.index({ skillsNeeded: 1, status: 1 })
=======
collaborationRequestSchema.index(
  { requesterUserId: 1, targetUserId: 1, postId: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } },
)
>>>>>>> feature/ui-threejs

module.exports = mongoose.model('CollaborationRequest', collaborationRequestSchema)
