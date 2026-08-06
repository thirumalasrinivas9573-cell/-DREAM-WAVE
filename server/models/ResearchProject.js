const mongoose = require('mongoose')

const STATUSES = ['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']

const researchPlanStepSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 200, required: true },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  order: { type: Number, min: 1, default: 1 },
  completed: { type: Boolean, default: false },
}, { _id: true })

const researchProjectSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  question: { type: String, trim: true, maxlength: 1000, default: '' },
  description: { type: String, trim: true, maxlength: 5000, default: '' },
  status: { type: String, enum: STATUSES, default: 'DRAFT', index: true },
  topics: [{ type: String, trim: true, maxlength: 80 }],
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', index: true },
  roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSubject' },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryBook' },
  researchPlan: [researchPlanStepSchema],
  synthesis: { type: String, trim: true, maxlength: 20000, default: '' },
  findings: { type: String, trim: true, maxlength: 10000, default: '' },
  report: {
    summary: { type: String, trim: true, maxlength: 4000, default: '' },
    sections: [{ title: String, content: String }],
    generatedAt: Date,
  },
  connections: {
    skills: [{ type: String, trim: true, maxlength: 80 }],
    careerRoles: [{ type: String, trim: true, maxlength: 80 }],
    learningActions: [{ type: String, trim: true, maxlength: 200 }],
  },
}, { timestamps: true })

researchProjectSchema.index({ studentId: 1, status: 1, updatedAt: -1 })

module.exports = mongoose.model('ResearchProject', researchProjectSchema)
module.exports.STATUSES = STATUSES
