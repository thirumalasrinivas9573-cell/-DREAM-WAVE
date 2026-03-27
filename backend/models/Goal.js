const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  // Presentation mode compatibility: keep old fields if present
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  // New required fields for Atlas integration
  title: { type: String, required: true },
  category: { type: String },
  duration: { type: String },
  skillLevel: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Goal', goalSchema);
