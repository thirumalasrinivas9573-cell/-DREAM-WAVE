const express = require('express');
// MongoDB removed for demo mode. No model needed.
const auth = require('../middleware/auth');

const router = express.Router();

// Update profile
router.put('/update', auth, async (req, res) => {
  try {
    const { password, email, ...safe } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { $set: safe }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Update AA ID (unique check)
router.put('/update-aaid', auth, async (req, res) => {
  try {
    const { aaId } = req.body;
    if (!aaId) return res.status(400).json({ message: 'AA ID is required' });

    const clean = aaId.trim().toLowerCase().replace(/\s+/g, '');
    if (!/^[a-z0-9_.]{3,20}$/.test(clean))
      return res.status(400).json({ message: 'AA ID must be 3–20 chars: letters, numbers, _ or .' });

    const existing = await User.findOne({ aaId: clean, _id: { $ne: req.userId } });
    if (existing) return res.status(400).json({ message: 'AA ID already taken' });

    const user = await User.findByIdAndUpdate(req.userId, { aaId: clean, username: clean }, { new: true }).select('-password');
    res.json({ message: 'AA ID updated', aaId: user.aaId, user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating AA ID' });
  }
});

// Get profile by aaId (@handle)
router.get('/aa/:aaId', async (req, res) => {
  try {
    const user = await User.findOne({ aaId: req.params.aaId.toLowerCase() }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Get profile by username (legacy)
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

module.exports = router;
