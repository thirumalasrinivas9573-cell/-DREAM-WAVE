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
  const { message } = req.body;
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

// Daily Life AI — handles cooking, health, workout, routine, room design, etc.
router.post('/message', auth, async (req, res) => {
  const { message, mode } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });

  const systemPrompts = {
    cooking: `You are a master chef and traditional cooking expert with deep knowledge of world cuisines, nutrition, and food science. When given ingredients or a recipe request:
- Provide detailed, step-by-step recipes with exact measurements
- Include cooking time, temperature, and technique tips
- Suggest ingredient substitutions if needed
- Add nutritional highlights and health benefits
- Share traditional cooking secrets and pro tips
Be warm, practical, and thorough. Format clearly with sections.`,

    health: `You are a certified health and wellness advisor with expertise in natural medicine, nutrition, and lifestyle optimization. When asked about health topics:
- Give evidence-based natural remedies and lifestyle advice
- Include specific herbs, foods, and practices with dosages/timing
- Provide a structured daily health protocol
- Mention when to consult a doctor
- Be holistic — address body, mind, and habits
Never diagnose. Be practical, warm, and detailed.`,

    workout: `You are an expert personal trainer and sports scientist. When asked about workouts, fitness, or exercise:
- Create detailed workout plans with sets, reps, rest times
- Explain proper form and technique for each exercise
- Include warm-up and cool-down routines
- Adapt plans for different fitness levels (beginner/intermediate/advanced)
- Add nutrition tips for pre/post workout
- Include weekly progression plans
Be motivating, precise, and safety-conscious.`,

    jogging: `You are a certified running coach and endurance sports expert. When asked about jogging, running, or cardio:
- Provide structured running programs (Couch to 5K style or beyond)
- Include pace guidance, breathing techniques, and form tips
- Create weekly training schedules with rest days
- Address common running injuries and prevention
- Give gear recommendations and warm-up/cool-down routines
- Include mental strategies for long runs
Be encouraging, detailed, and practical.`,

    routine: `You are a productivity coach and life optimization expert. When asked to build a daily routine:
- Create a detailed hour-by-hour schedule
- Balance work, exercise, meals, learning, and rest
- Include morning and evening rituals
- Add time-blocking strategies and habit stacking tips
- Customize for the person's specific goals and lifestyle
- Include weekly review and adjustment strategies
Be structured, realistic, and motivating.`,

    room: `You are an expert interior designer with knowledge of space planning, color theory, and home decor. When asked about room design:
- Provide detailed room layout and furniture arrangement suggestions
- Recommend color palettes with specific color codes
- Suggest lighting setups (ambient, task, accent)
- Include budget-friendly and premium options
- Add storage solutions and space optimization tips
- Recommend specific furniture styles and decor items
Be creative, practical, and visually descriptive.`,

    general: `You are a knowledgeable daily life assistant covering cooking, fitness, health, home design, productivity, and lifestyle. Provide detailed, practical, and actionable advice. Be thorough, warm, and helpful. Format your response clearly with sections when appropriate.`
  };

  const systemContent = systemPrompts[mode] || systemPrompts.general;

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
          { role: 'system', content: systemContent },
          { role: 'user', content: message }
        ],
        max_tokens: 1200,
        temperature: 0.75
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json();
      console.error('OpenAI daily-life error:', err);
      return res.status(500).json({ message: 'OpenAI API error', error: err.error?.message });
    }

    const data = await openaiRes.json();
    res.json({ reply: data.choices[0].message.content, mode, aiProvider: 'gpt-4o-mini' });

  } catch (error) {
    console.error('Daily life AI error:', error.message);
    res.status(500).json({ message: 'Error communicating with AI', error: error.message });
  }
});

module.exports = router;

// ── Universal Wisdom Mentor ──
router.post('/wisdom', auth, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });

  const systemPrompt = `You are a Universal Wisdom Mentor — a calm, strong, and deeply insightful guide for all areas of life.

Your role is to help users with:
- Career decisions and professional growth
- Emotional clarity and mental strength
- Health and physical balance
- Strategic thinking and decision making
- Creative expression and innovation
- Daily discipline and habit building
- Life balance and purpose

RESPONSE FORMAT — always structure your response exactly like this:

🧭 DOMAIN: [career / emotion / health / strategy / creativity / discipline / life]

💛 EMPATHY
[1-2 sentences acknowledging what the user is feeling or facing]

🔍 CLARITY
[Explain the situation clearly in 2-3 sentences. Cut through confusion.]

🌟 GUIDANCE
[Give clear direction. What should they focus on? 2-3 sentences.]

⚡ ACTION STEPS
1. [First concrete action]
2. [Second concrete action]
3. [Third concrete action]

🏛️ PRINCIPLE
[One timeless principle that applies to this situation]

✨ WISDOM
"[A short, powerful wisdom line — original, not a famous quote]"

🔥 EMPOWERMENT
[One final sentence that leaves the user feeling strong and capable]

STYLE RULES:
- Calm and strong tone
- Simple, clear English
- No unnecessary words
- Mentor-like, not preachy
- Practical over philosophical
- Always end with empowerment`;

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 700,
        temperature: 0.72
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json();
      return res.status(500).json({ message: 'AI error', error: err.error?.message });
    }

    const data = await openaiRes.json();
    const raw = data.choices[0].message.content;

    // Extract domain tag
    const domainMatch = raw.match(/DOMAIN:\s*\[?(\w+)\]?/i);
    const domain = domainMatch ? domainMatch[1].toLowerCase() : 'life';

    res.json({ response: raw, domain, aiProvider: 'gpt-4o-mini' });
  } catch (error) {
    console.error('Wisdom mentor error:', error.message);
    res.status(500).json({ message: 'Error communicating with AI', error: error.message });
  }
});
