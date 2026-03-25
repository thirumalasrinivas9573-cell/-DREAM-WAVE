const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register — name, email, password required. aaId optional (can be set now or later).
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, aaId } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    // Validate aaId if provided
    if (aaId) {
      const handle = aaId.trim().toLowerCase().replace(/^@/, '');
      if (handle.length < 3) return res.status(400).json({ message: 'AA ID must be at least 3 characters' });
      if (!/^[a-z0-9_]+$/.test(handle)) return res.status(400).json({ message: 'AA ID can only contain letters, numbers, and underscores' });
      const existingAaId = await User.findOne({ aaId: handle });
      if (existingAaId) return res.status(400).json({ message: 'AA ID already taken' });
    }

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = { name: name.trim(), email: email.trim().toLowerCase(), password: hashedPassword };
    if (aaId) userData.aaId = aaId.trim().toLowerCase().replace(/^@/, '');

    const user = new User(userData);
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'dreamwave_secret', { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, aaId: user.aaId || null, subscription: user.subscription }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login — supports email OR aaId
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'All fields required' });

    // Detect: if contains "@" and looks like email → email login, else → aaId login
    let user;
    const identifier = email.trim().toLowerCase();
    const isEmail = identifier.includes('@') && identifier.includes('.');

    if (isEmail) {
      user = await User.findOne({ email: identifier });
    } else {
      // Strip leading @ if user typed it anyway
      const handle = identifier.replace(/^@/, '');
      // Try aaId first, fall back to username (for older accounts)
      user = await User.findOne({ aaId: handle });
      if (!user) user = await User.findOne({ username: handle });
    }

    if (!user) {
      const msg = isEmail ? 'No account found with that email' : 'No account found with that AA ID';
      return res.status(400).json({ message: msg });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    // Update streak
    const now = new Date();
    const last = user.lastActive ? new Date(user.lastActive) : null;
    if (last) {
      const diff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
      if (diff === 1) user.streak = (user.streak || 0) + 1;
      else if (diff > 1) user.streak = 1;
    } else {
      user.streak = 1;
    }
    user.lastActive = now;
    user.isOnline = true;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'dreamwave_secret', { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, aaId: user.aaId, username: user.username, subscription: user.subscription, learningMode: user.learningMode }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check aaId availability
router.get('/check-aaid/:aaId', async (req, res) => {
  try {
    const exists = await User.findOne({ aaId: req.params.aaId.toLowerCase() });
    res.json({ available: !exists });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
