const express = require('express');
// MongoDB removed for demo mode. No model needed.
const auth = require('../middleware/auth');

const router = express.Router();

// Check if two users are comrades
async function areComrades(userId1, userId2) {
  const c = await Comrade.findOne({
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 }
    ],
    status: 'accepted'
  });
  return !!c;
}

// Send message (comrades only)
router.post('/send/:receiverId', auth, async (req, res) => {
  try {
    const ok = await areComrades(req.userId, req.params.receiverId);
    if (!ok) return res.status(403).json({ message: 'You can only chat with comrades' });

    const msg = new Message({ sender: req.userId, receiver: req.params.receiverId, text: req.body.text });
    await msg.save();
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversation with a user
router.get('/conversation/:otherId', auth, async (req, res) => {
  try {
    const ok = await areComrades(req.userId, req.params.otherId);
    if (!ok) return res.status(403).json({ message: 'Not comrades' });

    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: req.params.otherId },
        { sender: req.params.otherId, receiver: req.userId }
      ]
    }).sort({ createdAt: 1 }).limit(100);

    // Mark as read
    await Message.updateMany({ sender: req.params.otherId, receiver: req.userId, read: false }, { read: true });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat list (all comrades with last message)
router.get('/chats', auth, async (req, res) => {
  try {
    const comrades = await Comrade.find({
      $or: [{ requester: req.userId }, { recipient: req.userId }],
      status: 'accepted'
    }).populate('requester', 'name aaId profilePhoto isOnline')
      .populate('recipient', 'name aaId profilePhoto isOnline');

    const chats = await Promise.all(comrades.map(async c => {
      const other = c.requester._id.toString() === req.userId ? c.recipient : c.requester;
      const lastMsg = await Message.findOne({
        $or: [
          { sender: req.userId, receiver: other._id },
          { sender: other._id, receiver: req.userId }
        ]
      }).sort({ createdAt: -1 });
      const unread = await Message.countDocuments({ sender: other._id, receiver: req.userId, read: false });
      return { user: other, lastMessage: lastMsg, unread };
    }));

    res.json(chats.sort((a, b) => {
      const ta = a.lastMessage?.createdAt || 0;
      const tb = b.lastMessage?.createdAt || 0;
      return new Date(tb) - new Date(ta);
    }));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
