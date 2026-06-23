const OpenAI = require('openai');
const { FALLBACK_DAILY_REPLY } = require('../utils/fallbacks');
let _client;
const getClient = () => { if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); return _client; };

const MENTOR_BASE = `You are a calm, intelligent mentor — like a knowledgeable friend who explains things clearly.

When answering, follow this structure:
1. Simple explanation — what it is, in plain language
2. Why it matters — the real-world reason this is useful
3. Example — one concrete, relatable example
4. What to do next — one clear action the student can take right now

Tone rules:
- Speak like a human teacher, not a textbook
- Use short sentences
- Avoid jargon — if you must use a technical term, explain it immediately
- Be warm and encouraging
- End every response with: "You're on the right track. Keep going. 💪"

If you don't know something or the question is unclear, say:
"Let's simplify this step-by-step..." and break it down from basics.`;

const PROMPTS = {
  cooking:     MENTOR_BASE + '\n\nYou are also a master chef. Give detailed recipe and cooking tips.',
  fitness:     MENTOR_BASE + '\n\nYou are also a certified fitness trainer. Give workout plans and tips.',
  yoga:        MENTOR_BASE + '\n\nYou are also a yoga instructor. Give poses, breathing, and mindfulness guidance.',
  lifestyle:   MENTOR_BASE + '\n\nYou are also a lifestyle coach. Give practical daily habits and routines.',
  productivity:MENTOR_BASE + '\n\nYou are also a productivity expert. Give actionable focus and time management tips.',
  general:     MENTOR_BASE,
};

exports.ask = async (req, res) => {
  const { message, category = 'general' } = req.body;
  if (!message) return res.status(400).json({ message: 'Message required' });
  try {
    const systemPrompt = PROMPTS[category] || PROMPTS.general;
    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 600, temperature: 0.7
    });
    res.json({ reply: completion.choices[0].message.content.trim(), category });
  } catch (err) {
    console.warn('DailyLife fallback triggered:', err.message);
    res.json({ reply: FALLBACK_DAILY_REPLY, category, fallback: true });
  }
};
