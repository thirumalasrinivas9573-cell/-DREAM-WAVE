const mongoose = require('mongoose')

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
}, { timestamps: true })

module.exports = mongoose.model('Goal', goalSchema)
