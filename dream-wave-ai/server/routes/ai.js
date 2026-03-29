const router      = require('express').Router();
const auth        = require('../middleware/auth');
const { analyzeUserGoal } = require('../services/aiService');
const GoalSession = require('../models/GoalSession');
const User        = require('../models/User');

// POST /api/ai/analyze
// Body: { goal, age, education, skills, interests, experience }
router.post('/analyze', auth, async (req, res) => {
  const { goal, age, education, skills, interests, experience } = req.body;

  if (!goal || !age || !education || !skills || !interests) {
    return res.status(400).json({ message: 'All fields required: goal, age, education, skills, interests' });
  }

  try {
    // Call OpenAI
    const aiAnalysis = await analyzeUserGoal({ goal, age, education, skills, interests, experience });

    // Save session to MongoDB
    const session = await GoalSession.create({
      userId: req.user._id,
      goal,
      answers: { age, education, skills, interests, experience },
      aiAnalysis
    });

    // Update user's goal field
    await User.findByIdAndUpdate(req.user._id, { goal });

    res.json({ sessionId: session._id, aiAnalysis });
  } catch (err) {
    console.error('AI analyze error:', err.message);
    res.status(500).json({ message: 'AI analysis failed', error: err.message });
  }
});

// GET /api/ai/sessions — get user's past goal sessions
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await GoalSession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('goal aiAnalysis createdAt');
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sessions' });
  }
});

module.exports = router;
