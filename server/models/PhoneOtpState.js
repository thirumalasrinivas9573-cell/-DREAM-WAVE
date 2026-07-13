const mongoose = require('mongoose');

/**
 * Durable phone OTP rate-limit + verified-phone cache (replaces in-memory Maps).
 */
const phoneOtpStateSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },
  sendTimestamps: { type: [Date], default: [] },
  verifiedUntil: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('PhoneOtpState', phoneOtpStateSchema);
