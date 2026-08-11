const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    title: { type: String, default: 'Focus session', maxlength: 160 },
    mode: {
      type: String,
      enum: ['pomodoro', 'deep_work', 'study', 'break', 'custom'],
      default: 'pomodoro',
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'abandoned'],
      default: 'active',
      index: true,
    },
    plannedMinutes: { type: Number, min: 1, max: 240, default: 25 },
    breakMinutes: { type: Number, min: 0, max: 60, default: 5 },
    actualMinutes: { type: Number, min: 0, default: 0 },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    pausedAt: { type: Date },
    pauseTotalMs: { type: Number, default: 0 },
    relatedTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    relatedGoal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null },
    interruptions: { type: Number, min: 0, default: 0 },
    notes: { type: String, default: '', maxlength: 2000 },
    productivityScore: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true }
);

focusSessionSchema.index({ user: 1, startedAt: -1 });
focusSessionSchema.index({ user: 1, status: 1, startedAt: -1 });
focusSessionSchema.index({ organizationId: 1, user: 1, startedAt: -1 });

module.exports = mongoose.model('FocusSession', focusSessionSchema);
