const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
// MongoDB removed for demo mode. No model needed.

// POST /api/goals (create goal)
router.post('/', auth, async (req, res) => {
  try {
    const { name, category, duration, skillLevel } = req.body;
    if (!name) return res.status(400).json({ error: 'Goal name required' });
    const goal = new Goal({
      userId: req.userId,
      name,
      category,
      duration,
      skillLevel
    });
    await goal.save();
    res.json({ goal });
  } catch (e) {
    res.status(500).json({ error: 'Goal create error', details: e.message });
  }
});

// GET /api/goals (fetch user goals)
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId });
    res.json({ goals });
  } catch (e) {
    res.status(500).json({ error: 'Goal fetch error', details: e.message });
  }
});

module.exports = router;
