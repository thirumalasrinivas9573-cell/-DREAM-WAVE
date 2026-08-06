const mongoose = require('mongoose')

const institutionSchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
      unique: true,
    },
    name: { type: String, required: true, trim: true, index: true },
    type: {
      type: String,
      enum: ['university', 'college', 'school', 'institute', 'other'],
      default: 'college',
    },
    code: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },
    logoUrl: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '', index: true },
    state: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '', index: true },
    description: { type: String, trim: true, default: '' },
    departments: [{ type: String, trim: true }],
    programs: [{ type: String, trim: true }],
    verified: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true },
)

institutionSchema.index({ name: 'text', city: 'text', country: 'text' })

module.exports = mongoose.model('Institution', institutionSchema)
