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
