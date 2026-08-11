const mongoose = require('mongoose');

<<<<<<< Updated upstream
const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  category: {
    type: String,
    enum: ['Education', 'Career', 'Personal', 'Health', 'Finance'],
    default: 'Personal',
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  deadline: {
    type: Date,
  },
  aiPlan: [{
    type: String,
  }],
<<<<<<< Updated upstream
=======
  milestones: [{
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'blocked'],
      default: 'not-started',
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    targetDate: Date,
    dependencies: [{ type: mongoose.Schema.Types.ObjectId }],
    completedAt: Date,
  }],
  // Required skills for Goal → Skill mapping (Learning Intelligence). Strings only — no invented catalog.
  requiredSkills: [{
    type: String,
    trim: true,
    maxlength: 100,
  }],
  resources: {
    books: [{
      title: { type: String, trim: true, maxlength: 200 },
      url: { type: String, trim: true, maxlength: 1000, default: '' },
      bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryBook' },
      source: { type: String, trim: true, maxlength: 80, default: '' },
      reason: { type: String, trim: true, maxlength: 300, default: '' },
    }],
    courses: [{
      title: { type: String, trim: true, maxlength: 200 },
      url: { type: String, trim: true, maxlength: 1000, default: '' },
    }],
    projects: [{
      title: { type: String, trim: true, maxlength: 200 },
      description: { type: String, trim: true, maxlength: 1000, default: '' },
    }],
  },
  notes: [{
    text: { type: String, required: true, trim: true, maxlength: 4000 },
    createdAt: { type: Date, default: Date.now },
  }],
  progressHistory: [{
    date: { type: Date, default: Date.now },
    progress: { type: Number, min: 0, max: 100 },
    studyHours: { type: Number, min: 0, max: 24, default: 0 },
    note: { type: String, trim: true, maxlength: 500, default: '' },
  }],
  reminders: {
    milestoneDue: { type: Boolean, default: true },
    weeklyReview: { type: Boolean, default: true },
    monthlyReview: { type: Boolean, default: true },
  },
  completedAt: Date,
  pausedAt: Date,
  archivedAt: Date,
>>>>>>> Stashed changes
}, { timestamps: true })
=======
const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: Date,
  completedAt: Date,
});
>>>>>>> Stashed changes

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'general', maxlength: 80, index: true },
    status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    targetDate: Date,
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    milestones: [milestoneSchema],
    tags: [{ type: String, maxlength: 40 }],
    aiRecommended: { type: Boolean, default: false },
    aiSuggestion: { type: String, default: '', maxlength: 2000 },
  },
  { timestamps: true }
);

goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ user: 1, category: 1, status: 1 });
goalSchema.index({ user: 1, createdAt: -1 });
goalSchema.index({ organizationId: 1, user: 1 });
goalSchema.index({ organizationId: 1, createdAt: -1 });

goalSchema.methods.recalcProgress = function () {
  if (!this.milestones?.length) return this.progress;
  const done = this.milestones.filter((m) => m.completed).length;
  this.progress = Math.round((done / this.milestones.length) * 100);
  if (this.progress === 100) this.status = 'completed';
  return this.progress;
};

module.exports = mongoose.model('Goal', goalSchema);
