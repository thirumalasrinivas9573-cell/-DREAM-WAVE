const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  authorName:    { type: String, required: true },
  authorInitials:{ type: String, required: true },
  content:       { type: String, required: true, trim: true, maxlength: 1000 },
  tag: {
    type: String,
    enum: ['Achievement', 'Books', 'Goals', 'Habits', 'General'],
    default: 'General',
  },
  likes:    { type: [mongoose.Schema.Types.ObjectId], default: [] }, // array of userIds
  comments: [{
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name:    String,
    content: { type: String, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true })

module.exports = mongoose.model('Post', postSchema)
