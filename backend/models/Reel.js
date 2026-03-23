const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username:    { type: String },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  tag:         { type: String, default: '' },
  videoUrl:    { type: String, required: true }, // base64 or file path
  likes:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments:    [{
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    text:     String,
    createdAt:{ type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reel', reelSchema);
