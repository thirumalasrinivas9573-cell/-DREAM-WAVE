const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) =>
  jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const safeUser = (user) => ({
  id:       user._id,
  name:     user.name,
  email:    user.email,
  aaId:     user.aaId,
  goal:     user.goal,
  credits:  user.credits,
  streak:   user.streak,
  avatar:   user.avatar
});

// ── POST /api/auth/register ──────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    if (await User.findOne({ email }))
      return res.status(409).json({ message: 'Email already registered' });

    const user  = await User.create({ name, email, password });
    const token = signToken(user);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: safeUser(user)
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ── POST /api/auth/login ─────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = signToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: safeUser(user)
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ── POST /api/auth/login-aa ──────────────────────────────────────────────
exports.loginAA = async (req, res) => {
  try {
    const { aaId, password } = req.body;

    if (!aaId || !password)
      return res.status(400).json({ message: 'AA ID and password are required' });

    const user = await User.findOne({ aaId: aaId.toUpperCase() });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid AA ID or password' });

    const token = signToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: safeUser(user)
    });
  } catch (err) {
    console.error('AA login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ user: safeUser(req.user) });
};
