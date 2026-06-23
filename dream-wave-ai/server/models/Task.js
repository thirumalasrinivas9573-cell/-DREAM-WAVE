const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true
  },
  roadmapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    required: true
  },
  day: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    required: true,
    enum: ['learn', 'practice', 'quiz', 'revise', 'project', 'research']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  estimatedTime: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  resources: [{
    type: String,
    url: String,
    description: String
  }],
  notes: String,
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  },
  metadata: {
    phaseId: String,
    order: Number,
    aiGenerated: {
      type: Boolean,
      default: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
taskSchema.index({ userId: 1, goalId: 1, day: 1 });
taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ goalId: 1, completed: 1 });

// Mark task as completed
taskSchema.methods.markCompleted = function() {
  this.completed = true;
  this.completedAt = new Date();
  return this.save();
};

// Get tasks for specific day
taskSchema.statics.getTasksForDay = function(userId, goalId, day) {
  return this.find({ userId, goalId, day }).sort({ 'metadata.order': 1 });
};

// Get user's daily tasks
taskSchema.statics.getDailyTasks = function(userId, date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    userId,
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  }).populate('goalId', 'title category');
};

module.exports = mongoose.model('Task', taskSchema);