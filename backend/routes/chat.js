const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are an AI Career Intelligence Engine for Dream Wave — a platform for career guidance.
You have deep knowledge about all professions: tech, business, creative, medical, government, freelance, and finance.

When a user asks about a career, respond with this structured format:

**Career Overview** — what it is and why it matters
**Required Skills** — core, tools, soft skills
**Roadmap** — 🟢 Beginner / 🟡 Intermediate / 🔴 Advanced steps
**Daily & Weekly Tasks** — practical schedule
**Salary Range** — Indian market range
**Growth Opportunities** — career paths

For non-career questions, respond helpfully about learning, productivity, and motivation.
Always be structured, clear, and actionable.`;

// Regular chat
router.post('/', auth, async (req, res) => {
  const { message, context } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });

  try {
    const openaiRes = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json();
      console.error('OpenAI error:', err);
      return res.status(500).json({ message: 'OpenAI API error', error: err.error?.message });
    }

    const data = await openaiRes.json();
    res.json({ response: data.choices[0].message.content, aiProvider: 'gpt-4o-mini' });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ message: 'Error communicating with AI', error: error.message });
  }
});

// Report generation
router.post('/report', auth, async (req, res) => {
  const { occupation } = req.body;
  if (!occupation) return res.status(400).json({ message: 'Occupation is required' });

  const reportPrompt = `Generate a COMPLETE, DETAILED, PROFESSIONAL 4-YEAR CAREER REPORT for: ${occupation}

Include:
1. Introduction — definition, industry importance, global demand
2. Industry Problems & Gaps — challenges, skill gaps, opportunities
3. 4-Year R&D Roadmap — Year 1 (Foundation) → Year 2 (Development) → Year 3 (Advanced) → Year 4 (Expert)
4. Skill Intelligence — technical, soft skills, tools mastery
5. Projects — Beginner → Advanced → Industry level
6. Career Paths — Jobs, Business, Freelance
7. Salary & Earning Structure — entry / mid / expert / business
8. Successful People Analysis — 3-5 top people, background, timeline, earnings, key lessons
9. Realistic Career Timeline — year-by-year salary + skills + expertise
10. Failure Analysis — why people fail, mistakes to avoid
11. Future Scope — trends, AI impact
12. Final Master Summary

Rules: minimum 2500 words, deep practical content, real-world insights.`;

  try {
    const openaiRes = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: reportPrompt }],
        max_tokens: 4000,
        temperature: 0.8
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json();
      console.error('OpenAI report error:', err);
      return res.status(500).json({ message: 'OpenAI API error', error: err.error?.message });
    }

    const data = await openaiRes.json();
    res.json({ report: data.choices[0].message.content, occupation, aiProvider: 'gpt-4o-mini' });

  } catch (error) {
    console.error('Report error:', error.message);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
});

module.exports = router;
