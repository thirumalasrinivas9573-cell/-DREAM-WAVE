const mongoose = require('mongoose');

const institutionStudentSchema = new mongoose.Schema({
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  studentUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  email: { type: String, default: '' },
  rollNo: { type: String, default: '' },
  year: { type: String, default: '' },
  attendancePercent: { type: Number, default: 0 },
  gpa: { type: Number, default: 0 },
  academicNotes: { type: String, default: '' },
  performanceReport: { type: String, default: '' },
  certificates: [{ title: String, issuedAt: Date, url: String }],
  status: { type: String, enum: ['active', 'graduated', 'dropped', 'pending'], default: 'active' },
  admissionDate: { type: Date, default: Date.now },
}, { timestamps: true });

institutionStudentSchema.index({ institutionId: 1, email: 1 });

module.exports = mongoose.model('InstitutionStudent', institutionStudentSchema);
