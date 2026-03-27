const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const auth = require('../middleware/auth');
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

// POST /api/learning (suggest topics/notes)
router.post('/', auth, async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ error: 'Goal required' });
    const prompt = `For the goal: "${goal}", suggest a list of topics to learn, and provide short notes for each topic. Format like exam-prep. Link to exam-prep topics where possible.`;
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1800,
        temperature: 0.7
      })
    });
    if (!response.ok) throw new Error('OpenAI error');
    const data = await response.json();
    const learning = data.choices[0].message.content;
    res.json({ learning });
  } catch (e) {
    res.status(500).json({ error: 'Learning AI error', details: e.message });
  }
});

module.exports = router;
