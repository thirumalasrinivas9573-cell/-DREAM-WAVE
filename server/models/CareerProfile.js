const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 200 },
    provider: { type: String, default: '', maxlength: 120 },
    status: {
      type: String,
      enum: ['recommended', 'planned', 'in_progress', 'completed', 'expired'],
      default: 'planned',
    },
    skill: { type: String, default: '', maxlength: 120 },
    credentialId: { type: String, default: '', maxlength: 120 },
    targetDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    notes: { type: String, default: '', maxlength: 1000 },
  },
  { _id: true }
);

const careerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    headline: { type: String, default: '', maxlength: 200 },
    summary: { type: String, default: '', maxlength: 4000 },
    interests: [{ type: String, maxlength: 80 }],
    preferredDomains: [{ type: String, maxlength: 80 }],
    preferredCompanies: [{ type: String, maxlength: 120 }],
    preferredRoles: [{ type: String, maxlength: 120 }],
    targetRole: { type: String, default: '', maxlength: 160 },
    targetIndustry: { type: String, default: '', maxlength: 120 },
    experienceLevel: {
      type: String,
      enum: ['student', 'fresher', 'junior', 'mid', 'senior'],
      default: 'student',
    },
    academic: {
      degree: { type: String, default: '', maxlength: 160 },
      major: { type: String, default: '', maxlength: 160 },
      institution: { type: String, default: '', maxlength: 200 },
      graduationYear: { type: Number, default: null, min: 1950, max: 2100 },
      cgpa: { type: Number, default: null, min: 0, max: 10 },
      semester: { type: String, default: '', maxlength: 40 },
    },
    certifications: { type: [certificationSchema], default: [] },
    scores: {
      careerReadiness: { type: Number, default: 0, min: 0, max: 100 },
      placement: { type: Number, default: 0, min: 0, max: 100 },
      skill: { type: Number, default: 0, min: 0, max: 100 },
      interviewReadiness: { type: Number, default: 0, min: 0, max: 100 },
      resume: { type: Number, default: 0, min: 0, max: 100 },
      learningProgress: { type: Number, default: 0, min: 0, max: 100 },
      computedAt: { type: Date, default: null },
    },
    lastRecommendationsAt: { type: Date, default: null },
  },
  { timestamps: true }
);

careerProfileSchema.index({ organizationId: 1, user: 1 });
careerProfileSchema.index({ targetRole: 1 });

module.exports = mongoose.model('CareerProfile', careerProfileSchema);
