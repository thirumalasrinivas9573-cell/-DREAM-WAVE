const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goalId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null },
  goal:      { type: String, required: true },
  roadmap:   { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
