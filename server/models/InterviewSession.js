<<<<<<< HEAD
const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    role: { type: String, required: true, maxlength: 160 },
    company: { type: String, default: '', maxlength: 160 },
    type: {
      type: String,
      enum: ['technical', 'hr', 'mixed', 'mock'],
      default: 'mixed',
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed'],
      default: 'active',
      index: true,
    },
    questions: [
      {
        prompt: { type: String, maxlength: 2000 },
        category: { type: String, enum: ['technical', 'hr', 'behavioral'], default: 'technical' },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
        sampleAnswer: { type: String, default: '', maxlength: 4000 },
        userAnswer: { type: String, default: '', maxlength: 8000 },
        score: { type: Number, default: null, min: 0, max: 100 },
        feedback: { type: String, default: '', maxlength: 4000 },
      },
    ],
    overallScore: { type: Number, default: null, min: 0, max: 100 },
    overallFeedback: { type: String, default: '', maxlength: 8000 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

interviewSessionSchema.index({ user: 1, createdAt: -1 });
interviewSessionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
=======
const mongoose = require('mongoose')
const {
  INTERVIEW_MODES,
  SESSION_STATUSES,
  DIFFICULTY_LEVELS,
  QUESTION_SOURCES,
  EVAL_DIMENSIONS,
} = require('../constants/careerReadiness')

const questionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    text: { type: String, required: true },
    topic: { type: String, default: '' },
    skill: { type: String, default: '' },
    source: { type: String, enum: QUESTION_SOURCES, default: 'GENERATED' },
    sourceLabel: { type: String, default: 'Practice question inspired by role requirements' },
  },
  { _id: false },
)

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    answerText: { type: String, default: '' },
    feedback: {
      strengths: [{ type: String }],
      missing: [{ type: String }],
      improve: [{ type: String }],
      modelStructure: { type: String, default: '' },
    },
    scores: {
      TECHNICAL_ACCURACY: { type: Number, min: 0, max: 100, default: null },
      RELEVANCE: { type: Number, min: 0, max: 100, default: null },
      COMPLETENESS: { type: Number, min: 0, max: 100, default: null },
      CLARITY: { type: Number, min: 0, max: 100, default: null },
      STRUCTURE: { type: Number, min: 0, max: 100, default: null },
      EVIDENCE: { type: Number, min: 0, max: 100, default: null },
    },
    flags: [{ type: String }],
    followUp: { type: String, default: '' },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetRole: { type: String, default: '' },
    mode: { type: String, enum: INTERVIEW_MODES, default: 'MIXED' },
    difficulty: { type: String, enum: DIFFICULTY_LEVELS, default: 'INTERMEDIATE' },
    status: { type: String, enum: SESSION_STATUSES, default: 'NOT_STARTED', index: true },
    opportunityRef: { source: String, sourceId: String, title: String },
    questions: [questionSchema],
    answers: [answerSchema],
    questionCount: { type: Number, default: 5 },
    topics: [{ type: String }],
    weakTopics: [{ type: String }],
    report: {
      summary: String,
      strengths: [String],
      weakAreas: [String],
      skillsToImprove: [String],
      recommendedPractice: [String],
      nextLevel: String,
    },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

interviewSessionSchema.index({ userId: 1, status: 1, updatedAt: -1 })

module.exports = mongoose.model('InterviewSession', interviewSessionSchema)
>>>>>>> feature/ui-threejs
