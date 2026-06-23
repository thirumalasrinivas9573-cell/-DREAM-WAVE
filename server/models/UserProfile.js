const mongoose = require('mongoose')

// Stores personalization data that makes AI responses adaptive per user
const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },

  // Tone preference -- affects all AI agent responses
  tone: {
    type: String,
    enum: ['motivational', 'strict', 'calm', 'friendly'],
    default: 'calm',
  },

  // User-declared interests (used to personalize suggestions)
  interests: [{ type: String, trim: true }],

  // Career context
  currentRole:  { type: String, default: '' },
  targetRole:   { type: String, default: '' },
  skills:       [{ type: String, trim: true }],

  // AI-generated summary of the user's behavior/history (updated periodically)
  historySummary: { type: String, default: '' },

  // ── Progress tracking ─────────────────────────────────────────────────────
  consistencyScore: { type: Number, default: 0, min: 0, max: 100 },
  focusScore:       { type: Number, default: 50, min: 0, max: 100 },
  lastActivity:     { type: Date, default: null },
  dailyStreak:      { type: Number, default: 0 },
  progressHistory:  [{
    date:             { type: Date, default: Date.now },
    consistencyScore: Number,
    focusScore:       Number,
    aiChats:          Number,
  }],

  // ── AI Analytics (self-improving system) ─────────────────────────────────
  aiAnalytics: {
    mostAskedTopics:      [{ type: String }],
    totalQuestions:       { type: Number, default: 0 },
    goalAlignedQuestions: { type: Number, default: 0 },
    lastWeekActivity:     { type: Number, default: 0 },
  },

  // ── User Intelligence ─────────────────────────────────────────────────────
  engagementLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },
  improvementRate: { type: Number, default: 0 },  // % improvement over time
  usage: {
    mentorChats:      { type: Number, default: 0 },
    productivityChats:{ type: Number, default: 0 },
    researchChats:    { type: Number, default: 0 },
    careerChats:      { type: Number, default: 0 },
    resumeBuilds:     { type: Number, default: 0 },
    roadmapBuilds:    { type: Number, default: 0 },
  },

  // Notification preferences
  notifications: {
    dailyNudge:    { type: Boolean, default: true },
    weeklyReport:  { type: Boolean, default: true },
  },

}, { timestamps: true })

module.exports = mongoose.model('UserProfile', userProfileSchema)
