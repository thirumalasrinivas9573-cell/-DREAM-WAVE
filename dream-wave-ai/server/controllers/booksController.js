const OpenAI = require('openai');
let _client;
const getClient = () => { if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); return _client; };

exports.getBooks = async (req, res) => {
  const goal = req.params.goal || req.query.goal || '';
  if (!goal) return res.status(400).json({ message: 'Goal required' });
  try {
    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Recommend 8 books for someone pursuing: ${goal}
Return ONLY JSON:
{"books":[{"title":"","author":"","description":"One sentence why this book","category":"Technical/Mindset/Career/Finance","level":"Beginner/Intermediate/Advanced","free":true}]}`
      }],
      max_tokens: 800, temperature: 0.6,
      response_format: { type: 'json_object' }
    });
    const data = JSON.parse(completion.choices[0].message.content);
    res.json({ books: data.books || [], goal });
  } catch (err) {
    console.error('Books error:', err.message);
    const isQuota = err?.status === 429 || err?.code === 'insufficient_quota';
    res.status(isQuota ? 503 : 500).json({
      message: isQuota
        ? 'AI service temporarily unavailable. Please try again later.'
        : 'Books fetch failed'
    });
  }
};
