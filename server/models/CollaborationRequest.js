const mongoose = require('mongoose')

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
  },
  { timestamps: true },
)

collaborationRequestSchema.index({ status: 1, visibility: 1, createdAt: -1 })
collaborationRequestSchema.index({ skillsNeeded: 1, status: 1 })

module.exports = mongoose.model('CollaborationRequest', collaborationRequestSchema)
