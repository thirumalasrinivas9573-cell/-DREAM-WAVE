const mongoose = require('mongoose');

const userQuerySchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer:   { type: String, required: true },
  chunk:    { type: String, default: '' },      // matched Gita chunk
  domain:   { type: String, default: 'life' },  // topic domain
  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('UserQuery', userQuerySchema);
