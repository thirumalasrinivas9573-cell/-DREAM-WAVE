const User = require('../models/User');

// GET /api/user/me
exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

// PUT /api/user/me
exports.updateMe = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
