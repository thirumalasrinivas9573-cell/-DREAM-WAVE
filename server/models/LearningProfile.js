<<<<<<< HEAD
const mongoose = require('mongoose');

const learningProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'reading', 'kinesthetic', 'mixed'],
      default: 'mixed',
      index: true,
    },
    styleScores: {
      visual: { type: Number, default: 25, min: 0, max: 100 },
      auditory: { type: Number, default: 25, min: 0, max: 100 },
      reading: { type: Number, default: 25, min: 0, max: 100 },
      kinesthetic: { type: Number, default: 25, min: 0, max: 100 },
    },
    preferredPace: {
      type: String,
      enum: ['slow', 'moderate', 'fast'],
      default: 'moderate',
    },
    strengths: [
      {
        skill: { type: String, maxlength: 120 },
        score: { type: Number, min: 0, max: 100, default: 0 },
        evidence: { type: String, maxlength: 400, default: '' },
      },
    ],
    weaknesses: [
      {
        skill: { type: String, maxlength: 120 },
        score: { type: Number, min: 0, max: 100, default: 0 },
        evidence: { type: String, maxlength: 400, default: '' },
      },
    ],
    focusAreas: [{ type: String, maxlength: 120 }],
    careerGoal: { type: String, default: '', maxlength: 160 },
    assessmentHistory: [
      {
        type: { type: String, maxlength: 40 },
        score: { type: Number, min: 0, max: 100, default: 0 },
        summary: { type: String, maxlength: 1000, default: '' },
        at: { type: Date, default: Date.now },
      },
    ],
    lastAssessedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

learningProfileSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('LearningProfile', learningProfileSchema);
=======
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
>>>>>>> feature/ui-threejs
