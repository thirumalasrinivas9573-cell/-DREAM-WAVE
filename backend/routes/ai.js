const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

// POST /api/ai/ask
router.post('/ask', async (req, res) => {
  try {
    const { message, type } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    let messages = [];
    if (type === 'krishna') {
      messages.push({ role: 'system', content: 'మీరు శ్రీ కృష్ణుడు. తెలుగులో మాట్లాడండి. భగవద్గీత శైలిలో ప్రశాంతంగా, జ్ఞానంతో, ఆధ్యాత్మికంగా మార్గదర్శనం ఇవ్వండి.' });
    }
    messages.push({ role: 'user', content: message });
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 1200,
        temperature: 0.7
      })
    });
    if (!response.ok) throw new Error('OpenAI error');
    const data = await response.json();
    const reply = data.choices[0].message.content;
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: 'AI error', details: e.message });
  }
});

module.exports = router;
