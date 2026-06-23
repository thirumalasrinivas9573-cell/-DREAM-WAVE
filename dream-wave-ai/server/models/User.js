const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── AI Memory sub-schema ───────────────────────────────────────────────────
const aiMemorySchema = new mongoose.Schema({
  goal:            { type: String, default: '' },
  level:           { type: String, default: 'Beginner' },
  xp:              { type: Number, default: 0 },
  streak:          { type: Number, default: 0 },
  completedTasks:  { type: [String], default: [] },   // last 20
  weakAreas:       { type: [String], default: [] },   // last 10
  strongAreas:     { type: [String], default: [] },   // last 10
  lastTopics:      { type: [String], default: [] },   // last 10
  emotionalState:  { type: String, default: 'Normal' },
  learningSpeed:   { type: String, default: 'normal' },
  updatedAt:       { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:      { type: String, required: true, minlength: 6 },
  aaId:          { type: String, unique: true },
  avatar:        { type: String, default: '' },
  goal:          { type: String, default: '' },
  bio:           { type: String, default: '' },
  credits:       { type: Number, default: 0 },
  streak:        { type: Number, default: 0 },
  level:         { type: Number, default: 1 },
  // ── Gamification ──
  points:        { type: Number, default: 0 },
  achievements:  { type: [String], default: [] },
  lastLoginDate: { type: String, default: '' },
  loginStreak:   { type: Number, default: 0 },
  // ── AI Memory ──
  aiMemory:      { type: aiMemorySchema, default: () => ({}) },
  createdAt:     { type: Date, default: Date.now }
});

// Auto-generate aaId before saving
userSchema.pre('save', async function(next) {
  // Generate aaId only on new documents
  if (this.isNew && !this.aaId) {
    let unique = false;
    while (!unique) {
      const id = 'AA' + Math.floor(100000 + Math.random() * 900000);
      const exists = await mongoose.model('User').findOne({ aaId: id });
      if (!exists) { this.aaId = id; unique = true; }
    }
  }
  // Hash password only when modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.matchPassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
