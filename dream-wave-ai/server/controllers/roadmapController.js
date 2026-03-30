const Roadmap  = require('../models/Roadmap');
const Goal     = require('../models/Goal');
const { generateRoadmap } = require('../services/roadmapService');
const { saveGoalToFirebase } = require('../services/firebaseService');

// POST /api/roadmap/generate
exports.generate = async (req, res) => {
  const { sessionId } = req.body;

  try {
    // Build user data from goal session or request body
    let userData = {
      goal:       req.body.goal,
      age:        req.body.age,
      education:  req.body.education,
      skills:     req.body.skills,
      interests:  req.body.interests
    };

    let goalId = null;

    if (sessionId) {
      const session = await Goal.findOne({ _id: sessionId, userId: req.user._id });
      if (session) {
        goalId = session._id;
        userData.goal = session.goal || userData.goal;
        // Extract answers from conversation
        const userMessages = session.messages
          .filter(m => m.role === 'user')
          .map(m => m.content);
        if (userMessages[1]) userData.age        = userMessages[1];
        if (userMessages[2]) userData.education  = userMessages[2];
        if (userMessages[3]) userData.skills     = userMessages[3];
        if (userMessages[4]) userData.interests  = userMessages[4];
      }
    }

    if (!userData.goal)
      return res.status(400).json({ message: 'Goal is required' });

    console.log(`🗺️  Generating roadmap for: ${userData.goal}`);
    const roadmap = await generateRoadmap(userData);

    // Save to MongoDB
    const saved = await Roadmap.create({
      userId: req.user._id,
      goalId,
      goal:   userData.goal,
      roadmap
    });

    // Save to Firebase (non-blocking)
    saveGoalToFirebase(req.user._id, {
      goal:    userData.goal,
      roadmap,
      type:    'roadmap'
    }).catch(() => {});

    res.json({ roadmapId: saved._id, goal: userData.goal, roadmap });
  } catch (err) {
    console.error('Roadmap error:', err.message);
    const isQuota = err?.status === 429 || err?.code === 'insufficient_quota';
    res.status(isQuota ? 503 : 500).json({
      message: isQuota
        ? 'AI service temporarily unavailable. Please try again later.'
        : 'Roadmap generation failed'
    });
  }
};

// GET /api/roadmap/list
exports.list = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user._id })
      .sort({ createdAt: -1 }).limit(10)
      .select('goal createdAt _id');
    res.json({ roadmaps });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching roadmaps' });
  }
};

// GET /api/roadmap/:id
exports.getOne = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user._id });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
    res.json(roadmap);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching roadmap' });
  }
};
