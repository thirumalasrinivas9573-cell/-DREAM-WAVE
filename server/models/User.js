const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { ROLES, PLANS } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    aaid: {
      type: String,
      unique: true,
      default: () => 'AA' + crypto.randomBytes(4).toString('hex').toUpperCase(),
    },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
    profileImage: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    level: { type: Number, default: 1 },
    credits: { type: Number, default: 100 },
    streak: { type: Number, default: 0 },
    learningStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    lastStudyDate: { type: Date },
    plan: { type: String, enum: Object.values(PLANS), default: PLANS.FREE },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    stripeCustomerId: { type: String, default: '', index: true },
    stripeSubscriptionId: { type: String, default: '' },
    targetCareer: { type: String, default: '' },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    passwordChangedAt: { type: Date },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    emailOtpHash: String,
    emailOtpExpire: Date,
    emailOtpAttempts: { type: Number, default: 0 },
    emailOtpLockedUntil: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    refreshTokens: [
      {
        tokenHash: String,
        expiresAt: Date,
        userAgent: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    certificates: [
      {
        title: String,
        skill: String,
        issuedAt: { type: Date, default: Date.now },
        credentialId: String,
      },
    ],
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      language: { type: String, default: 'en' },
      notifications: { type: Boolean, default: true },
      emailUpdates: { type: Boolean, default: true },
      focusMinutes: { type: Number, default: 25 },
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ isActive: 1, email: 1 });
userSchema.index({ isActive: 1, updatedAt: -1 });
userSchema.index({ 'refreshTokens.expiresAt': 1 });
userSchema.index({ resetPasswordToken: 1 }, { unique: true, sparse: true });
userSchema.index({ emailVerificationToken: 1 }, { unique: true, sparse: true });
userSchema.index({ emailOtpLockedUntil: 1 }, { sparse: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

userSchema.methods.changedPasswordAfter = function (jwtIat) {
  if (!this.passwordChangedAt) return false;
  const changed = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return changed > jwtIat;
};

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role, type: 'access' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
    algorithm: 'HS256',
  });
};

userSchema.methods.getRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
      type: 'refresh',
      jti: crypto.randomBytes(16).toString('hex'),
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d', algorithm: 'HS256' }
  );
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

userSchema.methods.getEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

/** 6-digit email OTP (hashed). TTL 10 minutes. */
userSchema.methods.issueEmailOtp = function () {
  const code = String(crypto.randomInt(100000, 1000000));
  this.emailOtpHash = crypto.createHash('sha256').update(code).digest('hex');
  this.emailOtpExpire = Date.now() + 10 * 60 * 1000;
  this.emailOtpAttempts = 0;
  this.emailOtpLockedUntil = undefined;
  return code;
};

userSchema.methods.verifyEmailOtp = function (code) {
  if (!this.emailOtpHash || !this.emailOtpExpire) return false;
  if (this.emailOtpExpire < Date.now()) return false;
  const hash = crypto.createHash('sha256').update(String(code || '').trim()).digest('hex');
  return hash === this.emailOtpHash;
};

module.exports = mongoose.model('User', userSchema);
