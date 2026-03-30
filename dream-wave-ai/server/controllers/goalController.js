const Goal = require('../models/Goal');
const User = require('../models/User');
const { continueGoalChat, generateGoalSummary } = require('../services/openaiService');
const { saveGoalToFirebase } = require('../services/firebaseService');

const MAX_STEPS = 5;

// ── POST /api/goal/start ─────────────────────────────────────────────────
exports.startChat = async (req, res) => {
  try {
    // Delete any incomplete session for this user
    await Goal.deleteMany({ userId: req.user._id, completed: false });

    const firstMessage = 'Hello! I\'m your AI career guide. 🌟\n\nLet\'s start with the most important question:\n\n**What is your career goal or dream?** (e.g. Software Engineer, Doctor, Entrepreneur, Designer...)';

    const session = await Goal.create({
      userId:   req.user._id,
      messages: [{ role: 'assistant', content: firstMessage }],
      step:     1
    });

    res.json({
      sessionId: session._id,
      message:   firstMessage,
      step:      1,
      completed: false
    });
  } catch (err) {
    console.error('startChat error:', err.message);
    res.status(500).json({ message: 'Failed to start chat' });
  }
};

// ── POST /api/goal/continue ──────────────────────────────────────────────
exports.continueChat = async (req, res) => {
  try {
    const { sessionId, userMessage } = req.body;
    if (!sessionId || !userMessage?.trim())
      return res.status(400).json({ message: 'sessionId and userMessage required' });

    const session = await Goal.findOne({ _id: sessionId, userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.completed) return res.json({ message: 'Chat already completed', completed: true });

    // Add user message
    session.messages.push({ role: 'user', content: userMessage.trim() });

    // Extract goal from first user answer if not set
    if (!session.goal && session.step === 1) {
      session.goal = userMessage.trim().substring(0, 200);
    }

    const newStep = session.step + 1;
    session.step = newStep;

    // Get AI response
    const aiReply = await continueGoalChat(
      session.messages.map(m => ({ role: m.role, content: m.content }))
    );

    const isComplete = aiReply.includes('CHAT_COMPLETE') || newStep > MAX_STEPS;

    // Clean the reply (remove CHAT_COMPLETE marker)
    const cleanReply = aiReply.replace('CHAT_COMPLETE', '').trim();

    session.messages.push({ role: 'assistant', content: cleanReply });

    if (isComplete) {
      session.completed = true;

      // Generate summary
      const conversationText = session.messages
        .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
        .join('\n');

      try {
        session.summary = await generateGoalSummary(conversationText);
      } catch (e) {
        console.warn('Summary generation failed:', e.message);
      }

      // Save to Firebase (non-blocking)
      const fbId = await saveGoalToFirebase(req.user._id, {
        goal:     session.goal,
        messages: session.messages,
        summary:  session.summary
      });
      if (fbId) session.firebaseId = fbId;

      // Update user's goal field
      await User.findByIdAndUpdate(req.user._id, { goal: session.goal });
    }

    await session.save();

    res.json({
      message:   cleanReply,
      step:      newStep,
      completed: isComplete,
      summary:   isComplete ? session.summary : null,
      sessionId: session._id
    });
  } catch (err) {
    console.error('continueChat error:', err.message);
    const isQuota = err?.status === 429 || err?.code === 'insufficient_quota';
    res.status(isQuota ? 503 : 500).json({
      message: isQuota
        ? 'AI service temporarily unavailable. Please try again later.'
        : 'AI response failed'
    });
  }
};

// ── POST /api/goal/save ──────────────────────────────────────────────────
exports.saveGoal = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Goal.findOne({ _id: sessionId, userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    res.json({
      message:  'Goal saved successfully',
      goal:     session.goal,
      summary:  session.summary,
      sessionId: session._id
    });
  } catch (err) {
    res.status(500).json({ message: 'Save failed' });
  }
};

// ── GET /api/goal/history ────────────────────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const sessions = await Goal.find({ userId: req.user._id, completed: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('goal summary createdAt step');
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching history' });
  }
};
