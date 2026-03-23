const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Update streak
router.post('/streak', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const now = new Date();
    const last = user.lastActive ? new Date(user.lastActive) : null;

    let streak = user.streak || 0;
    if (last) {
      const diff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
      if (diff === 1) streak += 1;
      else if (diff > 1) streak = 1;
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

// Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({}, 'name username aaId points badges streak ambition level')
      .sort({ points: -1 })
      .limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User stats — includes computed level + badge auto-award
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    const rank = await User.countDocuments({ points: { $gt: user.points || 0 } }) + 1;

    // Compute level: 1 level per 100 points
    const level = Math.max(1, Math.floor((user.points || 0) / 100) + 1);

    // Auto-award badges based on milestones
    const badges = new Set(user.badges || []);
    const pts = user.points || 0;
    const streak = user.streak || 0;
    if (pts >= 100 && !badges.has('🌱 First Steps'))   badges.add('🌱 First Steps');
    if (pts >= 500 && !badges.has('⚡ Rising Star'))    badges.add('⚡ Rising Star');
    if (pts >= 1000 && !badges.has('🔥 On Fire'))       badges.add('🔥 On Fire');
    if (pts >= 5000 && !badges.has('🏆 Champion'))      badges.add('🏆 Champion');
    if (streak >= 7 && !badges.has('📅 Week Warrior'))  badges.add('📅 Week Warrior');
    if (streak >= 30 && !badges.has('💎 Month Master')) badges.add('💎 Month Master');

    const badgeArr = [...badges];
    if (badgeArr.length !== (user.badges || []).length) {
      await User.findByIdAndUpdate(req.userId, { badges: badgeArr, level });
    } else if (user.level !== level) {
      await User.findByIdAndUpdate(req.userId, { level });
    }

    const streakScore = Math.min(streak * 3, 40);
    const pointScore = Math.min(Math.floor(pts / 50), 60);
    const disciplineScore = Math.min(streakScore + pointScore, 100);

    res.json({ ...user.toObject(), rank, level, badges: badgeArr, disciplineScore });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
