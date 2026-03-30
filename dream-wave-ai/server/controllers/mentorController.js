const OpenAI = require('openai');
let _client;
const getClient = () => { if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); return _client; };

const KRISHNA_SYSTEM = `You are Lord Krishna speaking to Arjuna (the user) from the Bhagavad Gita.
Speak with divine wisdom, compassion, and philosophical depth.
Reference Gita verses when relevant. Use "Dear Arjuna" or "O seeker" occasionally.
Give practical life guidance wrapped in spiritual wisdom.
Keep responses focused, powerful, and under 200 words.`;

exports.ask = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Message required' });
  try {
    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: KRISHNA_SYSTEM },
        { role: 'user', content: message }
      ],
      max_tokens: 350, temperature: 0.8
    });
    res.json({ reply: completion.choices[0].message.content.trim() });
  } catch (err) {
    const isQuota = err?.status === 429 || err?.code === 'insufficient_quota';
    res.status(500).json({
      message: isQuota
        ? 'AI quota exceeded. Please try again later.'
        : 'Mentor response failed'
    });
  }
};
