const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  careerId:    { type: String, default: '' },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  type:        { type: String, enum: ['learning', 'practice', 'revision', 'quiz'], default: 'learning' },
  difficulty:  { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  points:      { type: Number, default: 10 },
  status:      { type: String, enum: ['pending', 'completed'], default: 'pending' },
  date:        { type: String }, // YYYY-MM-DD
  aiGenerated: { type: Boolean, default: false },
  createdAt:   { type: Date, default: Date.now }
});

// Compound index for fast daily task queries
taskSchema.index({ userId: 1, date: 1 });
taskSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
