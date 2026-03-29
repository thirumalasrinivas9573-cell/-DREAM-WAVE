const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:     { type: String, required: true },
  description: { type: String, default: '' },
  type:      { type: String, enum: ['task','quiz'], default: 'task' },
  category:  { type: String, default: 'general' },
  points:    { type: Number, default: 10 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Task', taskSchema);
