'use strict';
const mongoose = require('mongoose');

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const skillSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  why:   String,
}, { _id: false });

const stepSchema = new mongoose.Schema({
  step:        { type: Number, required: true },
  title:       { type: String, required: true },
  description: String,
  duration:    String,
}, { _id: false });

const learningPhaseSchema = new mongoose.Schema({
  phase:    String,
  duration: String,
  focus:    String,
}, { _id: false });

const courseSchema = new mongoose.Schema({
  title:    String,
  type:     { type: String, enum: ['Free', 'Paid'], default: 'Free' },
  platform: String,
  reason:   String,
}, { _id: false });

const bookSchema = new mongoose.Schema({
  title:   String,
  level:   String,
  purpose: String,
}, { _id: false });

const practiceSchema = new mongoose.Schema({
  stage:  String,
  task:   String,
  output: String,
}, { _id: false });

const projectSchema = new mongoose.Schema({
  title:       String,
  level:       String,
  description: String,
}, { _id: false });

const careerPathSchema = new mongoose.Schema({
  roles:       [String],
  salaryRange: String,
  growth:      String,
}, { _id: false });

const collegeSchema = new mongoose.Schema({
  name:     String,
  location: String,
  reason:   String,
}, { _id: false });

const timelineSchema = new mongoose.Schema({
  totalDuration: String,
  milestones:    [String],
}, { _id: false });

// ── Legacy phase schema (kept for backward compat) ───────────────────────────
const phaseTaskSchema = new mongoose.Schema({
  title:         String,
  description:   String,
  completed:     { type: Boolean, default: false },
  estimatedTime: String,
  priority:      { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
}, { _id: false });

const phaseSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  duration:    { type: String, required: true },
  description: String,
  skills:      [String],
  tasks:       [phaseTaskSchema],
  order:       { type: Number, required: true },
}, { _id: false });

// ── Main Roadmap schema ──────────────────────────────────────────────────────
const roadmapSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  goalId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Goal',  required: true },
  title:    { type: String, required: true },
  category: { type: String, required: true, enum: ['education', 'career', 'personal', 'health', 'finance'] },

  // ── Rich life-path data ──────────────────────────────────────────────────
  overview:       String,
  skills:         [skillSchema],
  stepByStepPath: [stepSchema],
  learningPlan:   [learningPhaseSchema],
  courses:        [courseSchema],
  books:          [bookSchema],
  practicePlan:   [practiceSchema],
  projects:       [projectSchema],
  careerPath:     careerPathSchema,
  colleges:       [collegeSchema],
  timeline:       timelineSchema,

  // ── Legacy phases (kept for task generation) ─────────────────────────────
  phases:        [phaseSchema],
  totalDuration: String,
  difficulty:    { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },

  progress: { type: Number, default: 0, min: 0, max: 100 },
  status:   { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  aiGenerated: { type: Boolean, default: true },

  metadata: {
    generationPrompt: String,
    aiModel:          String,
    generatedAt:      { type: Date, default: Date.now },
    deepData:         { type: Object, default: null },  // full R&D report + deep content
  },
}, { timestamps: true });

roadmapSchema.index({ userId: 1, goalId: 1 });
roadmapSchema.index({ userId: 1, status: 1 });

// Legacy method — kept for backward compat
roadmapSchema.methods.calculateProgress = function() {
  let total = 0, done = 0;
  (this.phases || []).forEach(p => {
    (p.tasks || []).forEach(t => { total++; if (t.completed) done++; });
  });
  this.progress = total > 0 ? Math.round((done / total) * 100) : 0;
  return this.save();
};

module.exports = mongoose.model('Roadmap', roadmapSchema);
