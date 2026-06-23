const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  role:    { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  ts:      { type: Date, default: Date.now },
})

const chatSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  session:  { type: String, default: 'default' }, // allows multiple named sessions per user
  messages: [messageSchema],
}, { timestamps: true })

module.exports = mongoose.model('Chat', chatSchema)
