const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  careerId: { type: String, required: true },
  phases: [{
    name:   String, // beginner / intermediate / advanced
    tasks:  [String],
    status: { type: String, enum: ['locked', 'active', 'completed'], default: 'locked' }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
