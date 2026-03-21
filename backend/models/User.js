const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  profilePhoto: { type: String, default: '' },
  education: { type: String, default: '' },
  careerGoals: { type: String, default: '' },
  skills: [String],
  certificates: [{
    title: String,
    date: Date,
    description: String
  }],
  achievements: [String],
  projects: [{
    title: String,
    description: String,
    link: String
  }],
  subscription: {
    type: String,
    enum: ['free', 'premium', 'pro'],
    default: 'free'
  },
  learningMode: {
    type: String,
    enum: ['reading', 'voice', 'visual'],
    default: 'reading'
  },
  aiAssistantName: { type: String, default: 'Dream AI' },
  careerAmbition: { type: String, default: '' },
  ambition: { type: String, default: '' },
  progress: { type: mongoose.Schema.Types.Mixed, default: {} },
  points: { type: Number, default: 0 },
  badges: [String],
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
