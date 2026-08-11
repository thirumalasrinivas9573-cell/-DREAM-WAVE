const mongoose = require('mongoose')
const { INNOVATION_EVENT_TYPES, EVENT_STATUSES } = require('../constants/institutionIncubation')

const registrationSchema = new mongoose.Schema(
  {
    registrantUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    registrantName: { type: String, trim: true, required: true },
    registrantEmail: { type: String, trim: true, default: '' },
    registrantType: { type: String, trim: true, default: 'student' },
    status: { type: String, enum: ['registered', 'attended', 'no_show', 'cancelled'], default: 'registered' },
    registeredAt: { type: Date, default: Date.now },
    outcomeNotes: { type: String, trim: true, default: '' },
  },
  { _id: true },
)

const institutionInnovationEventSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
      index: true,
    },
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, default: '' },
    eventType: { type: String, enum: INNOVATION_EVENT_TYPES, required: true, index: true },
    venue: { type: String, trim: true, default: '' },
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'offline' },
    meetingLink: { type: String, trim: true, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    registrationDeadline: { type: Date, default: null },
    capacity: { type: Number, default: null },
    status: { type: String, enum: EVENT_STATUSES, default: 'draft', index: true },
    publishedAt: { type: Date, default: null },
    registrations: [registrationSchema],
    outcomes: { type: String, trim: true, default: '' },
    linkedStartupIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InstitutionStartup' }],
    createdByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
)

institutionInnovationEventSchema.index({ institutionId: 1, status: 1 })
institutionInnovationEventSchema.index({ startDate: 1 })
institutionInnovationEventSchema.index({ title: 'text', description: 'text' })

module.exports = mongoose.model('InstitutionInnovationEvent', institutionInnovationEventSchema)
