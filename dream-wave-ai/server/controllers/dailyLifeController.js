const OpenAI = require('openai');
let _client;
const getClient = () => { if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); return _client; };

const PROMPTS = {
  cooking:     'You are a master chef. Give detailed recipe and cooking tips.',
  fitness:     'You are a certified fitness trainer. Give workout plans and tips.',
  yoga:        'You are a yoga instructor. Give poses, breathing, and mindfulness guidance.',
  lifestyle:   'You are a lifestyle coach. Give practical daily habits and routines.',
  productivity:'You are a productivity expert. Give actionable focus and time management tips.',
  general:     'You are a helpful daily life assistant. Give practical advice.'
};

exports.ask = async (req, res) => {
  const { message, category = 'general' } = req.body;
  if (!message) return res.status(400).json({ message: 'Message required' });
  try {
    const systemPrompt = PROMPTS[category] || PROMPTS.general;
    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt + ' Be concise, practical, and friendly. Use bullet points.' },
        { role: 'user', content: message }
      ],
      max_tokens: 500, temperature: 0.7
    });
    res.json({ reply: completion.choices[0].message.content.trim(), category });
  } catch (err) {
    const isQuota = err?.status === 429 || err?.code === 'insufficient_quota';
    res.status(500).json({
      message: isQuota
        ? 'AI quota exceeded. Please try again later.'
        : 'AI response failed'
    });
  }
};
