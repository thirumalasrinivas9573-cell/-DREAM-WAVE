const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    title: { type: String, default: 'My Resume' },
    headline: String,
    summary: String,
    experience: [{ company: String, role: String, start: String, end: String, bullets: [String] }],
    education: [{ school: String, degree: String, year: String }],
    skills: [String],
    projects: [{ name: String, description: String, link: String }],
    aiSuggestions: String,
    score: { type: Number, default: 0, min: 0, max: 100 },
    analysis: {
      strengths: [{ type: String, maxlength: 240 }],
      gaps: [{ type: String, maxlength: 240 }],
      suggestions: [{ type: String, maxlength: 400 }],
      keywordCoverage: { type: Number, default: 0, min: 0, max: 100 },
      lastAnalyzedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1, updatedAt: -1 });
resumeSchema.index({ organizationId: 1, user: 1 });

module.exports = mongoose.model('Resume', resumeSchema);
