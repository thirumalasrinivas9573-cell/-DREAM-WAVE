const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:            { type: String, required: true },
  email:           { type: String, required: true, unique: true },
  password:        { type: String, required: true },
  aaId:            { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  username:        { type: String, unique: true, sparse: true },
  profilePhoto:    { type: String, default: '' },
  bio:             { type: String, default: '' },
  education:       { type: String, default: '' },
  careerGoals:     { type: String, default: '' },
  skills:          [String],
  certificates:    [{ title: String, date: Date, description: String }],
  achievements:    [String],
  projects:        [{ title: String, description: String, link: String }],
  subscription:    { type: String, enum: ['free', 'premium', 'pro'], default: 'free' },
  learningMode:    { type: String, enum: ['reading', 'voice', 'visual'], default: 'reading' },
  aiAssistantName: { type: String, default: 'Dream AI' },
  careerAmbition:  { type: String, default: '' },
  ambition:        { type: String, default: '' },
  goal:            { type: String, default: '' },
  goalLocked:      { type: Boolean, default: false },
  timetable:       { type: mongoose.Schema.Types.Mixed, default: null },
  roadmap:         { type: mongoose.Schema.Types.Mixed, default: null },
  progress:        { type: mongoose.Schema.Types.Mixed, default: {} },
  age:             { type: String, default: '' },
  hoursPerDay:     { type: String, default: '2' },
  level:           { type: Number, default: 1 },
  dailyMission:    { type: mongoose.Schema.Types.Mixed, default: null },
  points:          { type: Number, default: 0 },
  credits:         { type: Number, default: 0 },
  badges:          [String],
  streak:          { type: Number, default: 0 },
  lastActive:      { type: Date, default: Date.now },
  isOnline:        { type: Boolean, default: false },
  createdAt:       { type: Date, default: Date.now }
});

// Text index for fast comrade search by name or aaId
userSchema.index({ name: 'text', aaId: 'text' });
// Index for online status and ambition queries
userSchema.index({ isOnline: 1 });
userSchema.index({ ambition: 1 });

module.exports = mongoose.model('User', userSchema);
