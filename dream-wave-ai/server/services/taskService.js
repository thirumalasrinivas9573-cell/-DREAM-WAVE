const OpenAI = require('openai');
let _client;
const getClient = () => { if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); return _client; };

async function generateTasks(goal, count = 5) {
  const completion = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `Generate ${count} practical daily tasks for someone pursuing: ${goal}
Return ONLY a JSON array like:
[{"title":"Task title","description":"What to do","type":"task","category":"learning","points":10}]
Mix task types: reading, practice, project, quiz. Keep titles short.`
    }],
    max_tokens: 600, temperature: 0.7,
    response_format: { type: 'json_object' }
  });
  const parsed = JSON.parse(completion.choices[0].message.content);
  return Array.isArray(parsed) ? parsed : (parsed.tasks || []);
}

module.exports = { generateTasks };
