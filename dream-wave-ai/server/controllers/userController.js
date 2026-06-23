const User = require('../models/User');

// ── Level thresholds (points-based) ──────────────────────────────────────
const LEVELS = [
  { level: 1, min: 0,    max: 100,  label: 'Beginner' },
  { level: 2, min: 100,  max: 300,  label: 'Explorer' },
  { level: 3, min: 300,  max: 700,  label: 'Learner' },
  { level: 4, min: 700,  max: 1500, label: 'Achiever' },
  { level: 5, min: 1500, max: 9999, label: 'Master' },
];

function computeLevelFromPoints(points) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].min) return LEVELS[i].level;
  }
  return 1;
}

// ── Achievement definitions ───────────────────────────────────────────────
const ACHIEVEMENT_RULES = [
  { id: 'first_goal',       label: '🎯 First Goal',        desc: 'Created your first goal' },
  { id: 'ai_explorer',      label: '🧠 AI Explorer',       desc: 'Asked AI for the first time' },
  { id: 'book_worm',        label: '📚 Book Worm',         desc: 'Opened your first book' },
  { id: 'streak_3',         label: '🔥 On Fire',           desc: '3-day login streak' },
  { id: 'streak_7',         label: '⚡ Week Warrior',      desc: '7-day login streak' },
  { id: 'points_100',       label: '💯 Century',           desc: 'Earned 100 points' },
  { id: 'points_500',       label: '🏆 High Achiever',     desc: 'Earned 500 points' },
  { id: 'task_complete',    label: '✅ Task Master',       desc: 'Completed your first task' },
  { id: 'report_generated', label: '📄 Report Pro',        desc: 'Generated a career report' },
];

// ── Award points + check achievements ────────────────────────────────────
async function awardPoints(userId, pts, trigger) {
  const user = await User.findById(userId);
  if (!user) return null;

  user.points = (user.points || 0) + pts;
  user.level  = computeLevelFromPoints(user.points);

  // Check achievements
  const earned = user.achievements || [];
  const newBadges = [];

  const check = (id, condition) => {
    if (condition && !earned.includes(id)) {
      earned.push(id);
      newBadges.push(id);
    }
  };

  check('first_goal',       trigger === 'goal_created');
  check('ai_explorer',      trigger === 'ai_chat');
  check('book_worm',        trigger === 'book_opened');
  check('task_complete',    trigger === 'task_completed');
  check('report_generated', trigger === 'report_generated');
  check('points_100',       user.points >= 100);
  check('points_500',       user.points >= 500);
  check('streak_3',         (user.loginStreak || 0) >= 3);
  check('streak_7',         (user.loginStreak || 0) >= 7);

  user.achievements = earned;
  await user.save();

  return { points: user.points, level: user.level, achievements: user.achievements, newBadges };
}

// ── GET /api/user/me ──────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

// ── PUT /api/user/me ──────────────────────────────────────────────────────
exports.updateMe = async (req, res) => {
  try {
    const { name, avatar, bio, goal } = req.body;
    const updates = {};
    if (name   !== undefined) updates.name   = name.trim();
    if (avatar !== undefined) updates.avatar = avatar;
    if (bio    !== undefined) updates.bio    = bio.trim();
    if (goal   !== undefined) updates.goal   = goal.trim();

    const user = await User.findByIdAndUpdate(
      req.user._id, updates, { new: true, runValidators: true }
    ).select('-password');

    user.level = computeLevelFromPoints(user.points || 0);
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/user/award ── award points for an action ───────────────────
exports.award = async (req, res) => {
  const POINT_MAP = {
    goal_created:      10,
    goal_completed:    50,
    ai_chat:            5,
    book_opened:        5,
    task_completed:    10,
    report_generated:  15,
    roadmap_generated: 10,
  };

  const { trigger } = req.body;
  const pts = POINT_MAP[trigger];
  if (!pts) return res.status(400).json({ message: 'Unknown trigger' });

  try {
    const result = await awardPoints(req.user._id, pts, trigger);
    res.json({ ...result, pointsAwarded: pts, trigger });
  } catch (err) {
    res.status(500).json({ message: 'Award failed' });
  }
};

// ── POST /api/user/login-streak ── call on every login ───────────────────
exports.updateLoginStreak = async (req, res) => {
  try {
    const user  = await User.findById(req.user._id);
    const today = new Date().toISOString().slice(0, 10);
    const last  = user.lastLoginDate || '';

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (last === today) {
      return res.json({ loginStreak: user.loginStreak, message: 'Already counted today' });
    }

    user.loginStreak   = last === yesterday ? (user.loginStreak || 0) + 1 : 1;
    user.lastLoginDate = today;

    // Check streak achievements
    const earned = user.achievements || [];
    if (user.loginStreak >= 3 && !earned.includes('streak_3')) earned.push('streak_3');
    if (user.loginStreak >= 7 && !earned.includes('streak_7')) earned.push('streak_7');
    user.achievements = earned;

    // Award daily login points
    user.points = (user.points || 0) + 2;
    user.level  = computeLevelFromPoints(user.points);

    await user.save();
    res.json({ loginStreak: user.loginStreak, points: user.points, achievements: user.achievements });
  } catch (err) {
    res.status(500).json({ message: 'Streak update failed' });
  }
};

// ── GET /api/user/gamification ── full gamification state ─────────────────
exports.getGamification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('points level loginStreak achievements credits streak');
    const points   = user.points || 0;
    const lvlIdx   = LEVELS.findIndex(l => points < l.max && points >= l.min);
    const current  = LEVELS[Math.max(lvlIdx, 0)];
    const next     = LEVELS[Math.min(lvlIdx + 1, LEVELS.length - 1)];
    const progress = current ? Math.round(((points - current.min) / (current.max - current.min)) * 100) : 100;

    const allBadges = ACHIEVEMENT_RULES.map(a => ({
      ...a,
      earned: (user.achievements || []).includes(a.id)
    }));

    res.json({
      points,
      level:       user.level || 1,
      levelLabel:  current?.label || 'Beginner',
      nextLevel:   next?.label || 'Master',
      nextMin:     next?.min || 9999,
      progress:    Math.min(progress, 100),
      loginStreak: user.loginStreak || 0,
      credits:     user.credits || 0,
      streak:      user.streak  || 0,
      achievements: allBadges,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching gamification data' });
  }
};

module.exports = { ...exports, ACHIEVEMENT_RULES, computeLevelFromPoints };
