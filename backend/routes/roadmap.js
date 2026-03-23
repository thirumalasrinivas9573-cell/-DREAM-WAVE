const express = require('express');
const Roadmap = require('../models/Roadmap');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's roadmap
router.get('/', auth, async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.userId });
    res.json(roadmap || null);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save / update roadmap
router.post('/', auth, async (req, res) => {
  try {
    const { goal, phases } = req.body;
    let roadmap = await Roadmap.findOne({ userId: req.userId });
    if (roadmap) {
      roadmap.goal = goal;
      roadmap.phases = phases;
      await roadmap.save();
    } else {
      roadmap = new Roadmap({ userId: req.userId, goal, phases });
      await roadmap.save();
    }
    res.json(roadmap);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
