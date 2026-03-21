const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Update streak on login
router.post('/streak', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const now = new Date();
    const last = user.lastActive ? new Date(user.lastActive) : null;

    let streak = user.streak || 0;
    if (last) {
      const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) streak += 1;
      else if (diffDays > 1) streak = 1;
      // same day: no change
    } else {
      streak = 1;
    }

    user.streak = streak;
    user.lastActive = now;
    await user.save();

    res.json({ streak });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard (top 20 by points)
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({}, 'name username points badges streak ambition')
      .sort({ points: -1 })
      .limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    const rank = await User.countDocuments({ points: { $gt: user.points || 0 } }) + 1;
    res.json({ ...user.toObject(), rank });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
