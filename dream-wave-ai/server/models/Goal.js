const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['education', 'career', 'personal', 'health', 'finance'],
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  targetDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  roadmapGenerated: {
    type: Boolean,
    default: false
  },
  tasksGenerated: {
    type: Boolean,
    default: false
  },
  metadata: {
    aiAnalysis: String,
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    estimatedDuration: String,
    tags: [String]
  }
}, {
  timestamps: true
});

// Index for efficient queries
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, category: 1 });

// Calculate progress based on completed tasks
goalSchema.methods.calculateProgress = async function() {
  const Task = mongoose.model('Task');
  const totalTasks = await Task.countDocuments({ goalId: this._id });
  const completedTasks = await Task.countDocuments({ goalId: this._id, completed: true });
  
  this.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  return this.save();
};

module.exports = mongoose.model('Goal', goalSchema);