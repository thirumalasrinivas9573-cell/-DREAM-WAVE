const express = require('express');
const Comrade = require('../models/Comrade');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Send comrade request
router.post('/request/:targetId', auth, async (req, res) => {
  try {
    if (req.params.targetId === req.userId)
      return res.status(400).json({ message: 'Cannot connect with yourself' });

    const existing = await Comrade.findOne({
      $or: [
        { requester: req.userId, recipient: req.params.targetId },
        { requester: req.params.targetId, recipient: req.userId }
      ]
    });
    if (existing) return res.status(400).json({ message: 'Request already exists', status: existing.status });

    const comrade = new Comrade({ requester: req.userId, recipient: req.params.targetId });
    await comrade.save();
    res.json({ message: 'Comrade request sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept / reject request
router.post('/respond/:requestId', auth, async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const comrade = await Comrade.findOne({ _id: req.params.requestId, recipient: req.userId });
    if (!comrade) return res.status(404).json({ message: 'Request not found' });

    comrade.status = action === 'accept' ? 'accepted' : 'rejected';
    await comrade.save();
    res.json({ message: `Request ${comrade.status}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my comrades (accepted)
router.get('/mine', auth, async (req, res) => {
  try {
    const comrades = await Comrade.find({
      $or: [{ requester: req.userId }, { recipient: req.userId }],
      status: 'accepted'
    }).populate('requester', 'name aaId profilePhoto ambition isOnline')
      .populate('recipient', 'name aaId profilePhoto ambition isOnline');

    const list = comrades.map(c => {
      const other = c.requester._id.toString() === req.userId ? c.recipient : c.requester;
      return other;
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending requests (received)
router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await Comrade.find({ recipient: req.userId, status: 'pending' })
      .populate('requester', 'name aaId profilePhoto ambition');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get connection status with a user
router.get('/status/:targetId', auth, async (req, res) => {
  try {
    const comrade = await Comrade.findOne({
      $or: [
        { requester: req.userId, recipient: req.params.targetId },
        { requester: req.params.targetId, recipient: req.userId }
      ]
    });
    res.json({ status: comrade ? comrade.status : 'none', id: comrade?._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users by aaId or name — returns all users (paginated) if no query
router.get('/search', auth, async (req, res) => {
  try {
    const q = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const filter = { _id: { $ne: req.userId } };
    if (q && q.trim()) {
      filter.$or = [
        { aaId: { $regex: q.trim(), $options: 'i' } },
        { name: { $regex: q.trim(), $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('name aaId profilePhoto ambition isOnline')
      .skip(skip)
      .limit(limit);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Suggest comrades (same ambition)
router.get('/suggestions', auth, async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    const existingIds = (await Comrade.find({
      $or: [{ requester: req.userId }, { recipient: req.userId }]
    })).map(c => c.requester.toString() === req.userId ? c.recipient : c.requester);

    const suggestions = await User.find({
      _id: { $ne: req.userId, $nin: existingIds },
      ambition: me.ambition || { $exists: true }
    }).select('name aaId profilePhoto ambition').limit(8);
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
