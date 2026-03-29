const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:   { type: String, required: true, maxlength: 500 },
  type:      { type: String, enum: ['post','achievement'], default: 'post' },
  likes:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments:  [{
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text:    { type: String, maxlength: 200 },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Post', postSchema);
