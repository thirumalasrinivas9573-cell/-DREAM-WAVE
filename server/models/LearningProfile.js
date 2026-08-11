const mongoose = require('mongoose')
const { LEARNING_FORMATS, MASTERY_STATES } = require('../constants/adaptiveLearning')

const skillMasterySchema = new mongoose.Schema(
  {
    skillId: { type: String, required: true },
    skillName: { type: String, required: true },
    category: { type: String, default: '' },
    state: { type: String, enum: MASTERY_STATES, default: 'NOT_STARTED' },
    evidenceCount: { type: Number, default: 0 },
    strongEvidenceCount: { type: Number, default: 0 },
    lastEvidenceAt: { type: Date, default: null },
    nextStep: { type: String, default: '' },
  },
  { _id: false },
)

const learningProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    currentGoal: { type: String, default: '' },
    targetRole: { type: String, default: '' },
    subjects: [{ type: String }],
    preferredFormats: [{ type: String, enum: LEARNING_FORMATS }],
    activePlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningPlan', default: null },
    activeRoadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', default: null },
    skillMasteries: [skillMasterySchema],
    weakAreas: [{ skill: String, topic: String, attemptCount: Number, lastSeen: Date }],
    revisionQueue: [{ skill: String, topic: String, reason: String, dueAt: Date }],
    deadlines: [{
      label: String,
      date: Date,
      type: { type: String, enum: ['EXAM', 'INTERVIEW', 'APPLICATION', 'COMPETITION', 'OTHER'] },
    }],
    completedResourceIds: [{ type: String }],
    totalStudyMinutes: { type: Number, default: 0 },
    lastStudyAt: { type: Date, default: null },
    graphRefs: [{ entityType: String, entityId: String, label: String }],
  },
  { timestamps: true },
)

module.exports = mongoose.model('LearningProfile', learningProfileSchema)
