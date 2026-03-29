const mongoose = require('mongoose');

const goalSessionSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goal:       { type: String, required: true },
  answers: {
    age:        String,
    education:  String,
    skills:     String,
    interests:  String,
    experience: String
  },
  aiAnalysis: { type: Object, default: null },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('GoalSession', goalSessionSchema);
