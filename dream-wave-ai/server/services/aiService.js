const OpenAI = require('openai');

// Lazy init so dotenv is loaded first
let _openai;
function getClient() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

const SYSTEM_PROMPT = `You are a career guidance AI for Dream Wave AI.
Analyze the user's answers and return a JSON object with this exact structure:
{
  "careerSuggestion": "Primary career recommendation",
  "alternativeCareers": ["option1", "option2"],
  "strengths": ["strength1", "strength2", "strength3"],
  "areasToImprove": ["area1", "area2"],
  "recommendedPath": "Step-by-step path description in 2-3 sentences",
  "timelineEstimate": "e.g. 2-3 years",
  "firstSteps": ["action1", "action2", "action3"],
  "motivationalMessage": "One powerful sentence to inspire the user"
}
Return ONLY valid JSON. No extra text.`;

async function analyzeUserGoal(data) {
  const userContent = `
User Goal: ${data.goal}
Age: ${data.age}
Education: ${data.education}
Current Skills: ${data.skills}
Interests: ${data.interests}
Experience: ${data.experience || 'None mentioned'}
`.trim();

  const completion = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: userContent }
    ],
    max_tokens: 600,
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(completion.choices[0].message.content);
}

module.exports = { analyzeUserGoal };
