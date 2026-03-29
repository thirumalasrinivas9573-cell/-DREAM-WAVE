const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role:    { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true }
}, { _id: false });

const goalSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goal:       { type: String, default: '' },
  messages:   [messageSchema],
  summary:    { type: Object, default: null },   // structured AI analysis
  firebaseId: { type: String, default: null },   // Firestore doc ID
  completed:  { type: Boolean, default: false },
  step:       { type: Number, default: 0 },
  reportUrl:  { type: String, default: null },   // path to generated PDF
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Goal', goalSchema);
