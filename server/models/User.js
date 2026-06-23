const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  aaid: {
    type: String,
    unique: true,
    default: () => 'AAID' + Math.random().toString(36).substr(2, 9).toUpperCase(),
  },
  profileImage: {
    type: String,
    default: ''
  },
  level: {
    type: Number,
    default: 1
  },
  credits: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  goals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }],
  certificates: [{
    type: String,
    default: []
  }],
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free',
  },
  planActivatedAt: {
    type: Date,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate AAID fallback (default handles this — kept for backward compat)
userSchema.pre('save', function(next) {
  if (!this.aaid) {
    this.aaid = 'AAID' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
