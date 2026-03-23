const express = require('express');
const Reel = require('../models/Reel');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Upload reel (video as base64 or multipart — stored in DB for simplicity)
router.post('/upload', auth, async (req, res) => {
  try {
    const { title, description, tag, videoData } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const user = await User.findById(req.userId);

    const reel = new Reel({
      userId: req.userId,
      username: user.username || user.name,
      title,
      description: description || '',
      tag: tag || '',
      videoUrl: videoData || '' // base64 video data
    });

    await reel.save();
    res.status(201).json({ message: 'Reel uploaded', reel });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all reels (feed)
router.get('/', async (req, res) => {
  try {
    const reels = await Reel.find().sort({ createdAt: -1 }).limit(30);
    res.json(reels);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's own reels
router.get('/mine', auth, async (req, res) => {
  try {
    const reels = await Reel.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(reels);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like / unlike reel
router.post('/:id/like', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    const idx = reel.likes.indexOf(req.userId);
    if (idx > -1) reel.likes.splice(idx, 1);
    else reel.likes.push(req.userId);

    await reel.save();
    res.json({ likes: reel.likes.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Comment on reel
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const user = await User.findById(req.userId);
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    reel.comments.push({ userId: req.userId, username: user.username || user.name, text });
    await reel.save();
    res.json(reel.comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
