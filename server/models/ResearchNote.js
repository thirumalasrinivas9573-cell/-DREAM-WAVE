const mongoose = require('mongoose')

const researchNoteSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResearchProject', required: true, index: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResearchSource' },
  title: { type: String, trim: true, maxlength: 200, default: '' },
  content: { type: String, trim: true, maxlength: 20000, default: '' },
  tags: [{ type: String, trim: true, maxlength: 40 }],
}, { timestamps: true })

researchNoteSchema.index({ studentId: 1, projectId: 1, updatedAt: -1 })

module.exports = mongoose.model('ResearchNote', researchNoteSchema)
