const User = require('../models/User');

// Compute level from streak + credits
function computeLevel(streak, credits) {
  const score = (credits * 100) + streak;
  if (score >= 2000) return 10;
  if (score >= 1000) return 8;
  if (score >= 500)  return 6;
  if (score >= 200)  return 4;
  if (score >= 50)   return 2;
  return 1;
}

// GET /api/user/me
exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

// PUT /api/user/me
exports.updateMe = async (req, res) => {
  try {
    const { name, avatar, bio, goal } = req.body;
    const updates = {};
    if (name  !== undefined) updates.name  = name.trim();
    if (avatar !== undefined) updates.avatar = avatar;
    if (bio   !== undefined) updates.bio   = bio.trim();
    if (goal  !== undefined) updates.goal  = goal.trim();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    // Recalculate level
    user.level = computeLevel(user.streak, user.credits);
    await user.save();

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
