const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  goal: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
