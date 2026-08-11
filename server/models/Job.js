const mongoose = require('mongoose');
const { JOB_STATUS, WORK_MODES } = require('../config/constants');

const jobSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, default: '', maxlength: 10000 },
    category: { type: String, default: 'General', maxlength: 80, index: true },
    skills: [{ type: String, trim: true, maxlength: 60 }],
    salary: {
      min: { type: Number, default: 0, min: 0 },
      max: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: 'INR', maxlength: 8 },
      period: { type: String, enum: ['year', 'month', 'hour'], default: 'year' },
    },
    location: { type: String, default: '', maxlength: 160 },
    workMode: { type: String, enum: WORK_MODES, default: 'onsite', index: true },
    status: { type: String, enum: JOB_STATUS, default: 'draft', index: true },
    openings: { type: Number, default: 1, min: 1, max: 500 },
    experienceMinYears: { type: Number, default: 0, min: 0, max: 40 },
    experienceMaxYears: { type: Number, default: 0, min: 0, max: 40 },
    education: { type: String, default: '', maxlength: 160 },
    publishedAt: { type: Date, default: null },
    closesAt: { type: Date, default: null },
    applicationCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

jobSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
jobSchema.index({ status: 1, publishedAt: -1 });
jobSchema.index({ title: 'text', description: 'text', category: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema);
