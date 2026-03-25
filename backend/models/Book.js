const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  author:      { type: String, default: 'Unknown', trim: true },
  description: { type: String, default: '' },
  category:    { type: String, default: 'General' },
  driveFileId: { type: String, required: true }, // Google Drive file ID
  coverUrl:    { type: String, default: '' },     // optional thumbnail
  tags:        [String],
  addedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  views:       { type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now }
});

bookSchema.index({ title: 'text', author: 'text', tags: 'text' });
bookSchema.index({ category: 1 });

module.exports = mongoose.model('Book', bookSchema);
