const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    title: { type: String, default: 'New conversation' },
    mode: {
      type: String,
      default: 'mentor',
      index: true,
    },
    model: { type: String, default: '', maxlength: 80 },
    contextSummary: { type: String, default: '', maxlength: 4000 },
    pinned: { type: Boolean, default: false },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
        content: { type: String, required: true },
        model: { type: String, default: '' },
        attachments: [
          {
            url: String,
            type: String,
            name: String,
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

chatSchema.index({ user: 1, updatedAt: -1 });
chatSchema.index({ user: 1, title: 'text' });
chatSchema.index({ organizationId: 1, user: 1 });
chatSchema.index({ organizationId: 1, updatedAt: -1 });
chatSchema.index({ user: 1, mode: 1, updatedAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
