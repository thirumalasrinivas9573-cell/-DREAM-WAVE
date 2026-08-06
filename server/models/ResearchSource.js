const mongoose = require('mongoose')

const SOURCE_TYPES = ['url', 'book', 'document', 'note', 'academic', 'manual']

const researchSourceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResearchProject', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 300 },
  sourceType: { type: String, enum: SOURCE_TYPES, default: 'manual' },
  url: { type: String, trim: true, maxlength: 2000, default: '' },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryBook' },
  rawText: { type: String, maxlength: 200000, default: '' },
  fileHash: { type: String, trim: true, maxlength: 128, index: true },
  author: { type: String, trim: true, maxlength: 200, default: '' },
  excerpt: { type: String, trim: true, maxlength: 2000, default: '' },
  indexedAt: Date,
  chunkCount: { type: Number, min: 0, default: 0 },
}, { timestamps: true })

researchSourceSchema.index({ studentId: 1, projectId: 1, updatedAt: -1 })

module.exports = mongoose.model('ResearchSource', researchSourceSchema)
module.exports.SOURCE_TYPES = SOURCE_TYPES
