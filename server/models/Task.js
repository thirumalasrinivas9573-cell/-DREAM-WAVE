const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
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
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['todo', 'in_progress', 'done', 'blocked'], default: 'todo' },
    dueDate: Date,
    scheduledAt: Date,
    estimatedMinutes: { type: Number, min: 0, max: 24 * 60, default: 0 },
    loggedMinutes: { type: Number, min: 0, default: 0 },
    goal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
    dependsOn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    tags: [{ type: String, maxlength: 40 }],
    aiPriorityScore: { type: Number, min: 0, max: 100, default: 0 },
    aiPriorityReason: { type: String, default: '', maxlength: 400 },
    recurrence: {
      enabled: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ['none', 'daily', 'weekly', 'monthly'],
        default: 'none',
      },
      interval: { type: Number, min: 1, max: 30, default: 1 },
      nextOccurrence: Date,
      endDate: Date,
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    completedAt: Date,
  },
  { timestamps: true }
);

taskSchema.index({ user: 1, status: 1, dueDate: 1 });
taskSchema.index({ user: 1, status: 1, completedAt: -1 });
taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ user: 1, scheduledAt: 1 });
taskSchema.index({ user: 1, aiPriorityScore: -1 });
taskSchema.index({ organizationId: 1, user: 1 });
taskSchema.index({ organizationId: 1, createdAt: -1 });
taskSchema.index({ user: 1, 'recurrence.enabled': 1, 'recurrence.nextOccurrence': 1 });
taskSchema.index({ goal: 1 });
taskSchema.index({ dependsOn: 1 });

module.exports = mongoose.model('Task', taskSchema);
