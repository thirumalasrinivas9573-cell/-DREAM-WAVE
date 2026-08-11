const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null, index: true },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    code: { type: String, trim: true, uppercase: true, maxlength: 30, default: '' },
    description: { type: String, default: '', maxlength: 2000 },
    credits: { type: Number, default: 0, min: 0, max: 60 },
    durationMonths: { type: Number, default: 12, min: 1, max: 72 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

courseSchema.index(
  { organizationId: 1, code: 1 },
  { unique: true, partialFilterExpression: { code: { $type: 'string', $gt: '' } } }
);
courseSchema.index({ organizationId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Course', courseSchema);
