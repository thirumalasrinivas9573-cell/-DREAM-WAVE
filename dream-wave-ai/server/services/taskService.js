const OpenAI = require('openai');
let _client;
const getClient = () => { if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); return _client; };

async function generateTasks(goal, count = 5) {
  const completion = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `You are a calm, practical mentor creating daily tasks for a student.
Student Goal: ${goal}

Generate ${count} specific, actionable daily tasks that feel achievable — not overwhelming.
Each task should:
- Be completable in 30-60 minutes
- Connect directly to the goal
- Feel like advice from a mentor, not a to-do list
- Have a clear description of what to do and why it matters

Return ONLY a JSON object (no markdown):
{"tasks": [{"title":"Short task title","description":"What to do and why it matters — 1-2 sentences, written like a mentor","type":"task","category":"learning","points":10}]}

Mix task types: reading, practice, project, reflection. Keep titles short and action-oriented.`
    }],
    max_tokens: 700, temperature: 0.7,
    response_format: { type: 'json_object' }
  });
  const parsed = JSON.parse(completion.choices[0].message.content);
  return Array.isArray(parsed) ? parsed : (parsed.tasks || []);
}

module.exports = { generateTasks };
