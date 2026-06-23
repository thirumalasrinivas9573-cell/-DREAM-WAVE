const router  = require('express').Router();
const OpenAI  = require('openai');
const auth    = require('../middleware/auth');
const { ask } = require('../controllers/mentorController');
const { MENTOR_PROMPT } = require('../ai/prompts/mentorMode');

let _openai;
const getClient = () => {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
};

// ── POST /api/mentor — authenticated chat (existing) ──────────────────────
router.post('/', auth, ask);

// ── POST /api/mentor/mentor-chat — context-aware chat ─────────────────────
router.post('/mentor-chat', async (req, res) => {
  try {
    const { message, userData } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'message required' });

    const response = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: MENTOR_PROMPT(userData, message) },
        { role: 'user',   content: message },
      ],
      max_tokens:  500,
      temperature: 0.82,
    });

    res.json({ reply: response.choices[0].message.content.trim() });
  } catch (error) {
    console.error('mentor-chat error:', error.message);
    res.status(500).json({ error: 'Mentor failed' });
  }
});

// ── GET /api/mentor/test-krishna — smoke test (no auth) ───────────────────
router.get('/test-krishna', async (req, res) => {
  const userInput = req.query.q || 'I failed in exam and feel useless';
  const userData  = {
    name:  req.query.name  || 'Arjun',
    goal:  req.query.goal  || 'Become a Software Engineer',
    level: req.query.level || 'Beginner',
    state: req.query.state || 'Sad',
  };

  try {
    const response = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: MENTOR_PROMPT(userData, userInput) },
        { role: 'user',   content: userInput },
      ],
      max_tokens:  500,
      temperature: 0.82,
    });

    res.json({ userData, input: userInput, reply: response.choices[0].message.content.trim() });
  } catch (err) {
    console.error('test-krishna error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
