<<<<<<< Updated upstream
const mongoose = require('mongoose')

const NOTE_TYPES = ['SOURCE_NOTE', 'IDEA', 'OBSERVATION', 'QUESTION', 'SUMMARY', 'FINDING', 'GENERAL']
const ORIGINS = ['USER_WRITTEN', 'AI_GENERATED', 'SOURCE_EXTRACTED']

const researchNoteSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResearchProject', required: true, index: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResearchSource' },
  title: { type: String, trim: true, maxlength: 200, default: '' },
  content: { type: String, trim: true, maxlength: 20000, default: '' },
  noteType: { type: String, enum: NOTE_TYPES, default: 'GENERAL', index: true },
  /** Distinguishes user writing from AI drafts and source extracts */
  origin: { type: String, enum: ORIGINS, default: 'USER_WRITTEN' },
  tags: [{ type: String, trim: true, maxlength: 40 }],
}, { timestamps: true })

researchNoteSchema.index({ studentId: 1, projectId: 1, updatedAt: -1 })

module.exports = mongoose.model('ResearchNote', researchNoteSchema)
module.exports.NOTE_TYPES = NOTE_TYPES
module.exports.ORIGINS = ORIGINS
=======
const mongoose = require('mongoose');

const researchNoteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchProject',
      required: true,
      index: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
      index: true,
    },
    title: { type: String, required: true, maxlength: 240, trim: true },
    body: { type: String, default: '', maxlength: 50000 },
    tags: [{ type: String, maxlength: 40 }],
    folderPath: { type: String, default: '/', maxlength: 240 },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchCollection',
      default: null,
    },
  },
  { timestamps: true }
);

researchNoteSchema.index({ user: 1, project: 1, updatedAt: -1 });
researchNoteSchema.index({ title: 'text', body: 'text', tags: 'text' });

module.exports = mongoose.model('ResearchNote', researchNoteSchema);
>>>>>>> Stashed changes
