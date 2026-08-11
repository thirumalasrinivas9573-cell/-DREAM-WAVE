<<<<<<< Updated upstream
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
  /** Researcher-stated objective / scope */
  objective: { type: String, trim: true, maxlength: 2000, default: '' },
  description: { type: String, trim: true, maxlength: 5000, default: '' },
  status: { type: String, enum: STATUSES, default: 'DRAFT', index: true },
  topics: [{ type: String, trim: true, maxlength: 80 }],
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', index: true },
  roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSubject' },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryBook' },
  /** Optional link to StudentProfile.projects subdocument _id (portfolio build project) */
  portfolioProjectId: { type: String, trim: true, maxlength: 40, default: '' },
  researchPlan: [researchPlanStepSchema],
  synthesis: { type: String, trim: true, maxlength: 20000, default: '' },
  findings: { type: String, trim: true, maxlength: 10000, default: '' },
  report: {
    summary: { type: String, trim: true, maxlength: 4000, default: '' },
    sections: [{ title: String, content: String }],
    generatedAt: Date,
    /** Labels AI-drafted report sections so they are not treated as verified findings */
    aiGenerated: { type: Boolean, default: true },
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
=======
const mongoose = require('mongoose');

const historyEntrySchema = new mongoose.Schema(
  {
    action: { type: String, required: true, maxlength: 80 },
    at: { type: Date, default: Date.now },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const researchProjectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    title: { type: String, required: true, maxlength: 240, trim: true },
    description: { type: String, default: '', maxlength: 5000 },
    category: {
      type: String,
      enum: [
        'general',
        'academic',
        'literature',
        'science',
        'technology',
        'business',
        'legal',
        'medical',
        'other',
      ],
      default: 'general',
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'completed', 'archived'],
      default: 'active',
      index: true,
    },
    tags: [{ type: String, maxlength: 40 }],
    folderPath: { type: String, default: '/', maxlength: 240 },
    history: { type: [historyEntrySchema], default: [] },
    stats: {
      documentCount: { type: Number, default: 0, min: 0 },
      noteCount: { type: Number, default: 0, min: 0 },
      highlightCount: { type: Number, default: 0, min: 0 },
      bookmarkCount: { type: Number, default: 0, min: 0 },
      knowledgeNodes: { type: Number, default: 0, min: 0 },
      readingProgressAvg: { type: Number, default: 0, min: 0, max: 100 },
      lastActivityAt: { type: Date, default: Date.now },
    },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

researchProjectSchema.index({ user: 1, createdAt: -1 });
researchProjectSchema.index({ user: 1, status: 1, updatedAt: -1 });
researchProjectSchema.index({ user: 1, category: 1 });
researchProjectSchema.index({ organizationId: 1, user: 1 });
researchProjectSchema.index({ title: 'text', description: 'text', tags: 'text' });

researchProjectSchema.methods.pushHistory = function pushHistory(action, meta = {}) {
  this.history = (this.history || []).slice(-99);
  this.history.push({ action, at: new Date(), meta });
  if (this.stats) this.stats.lastActivityAt = new Date();
};

module.exports = mongoose.model('ResearchProject', researchProjectSchema);
>>>>>>> Stashed changes
