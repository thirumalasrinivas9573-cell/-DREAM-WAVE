const OpenAI = require('openai');

let _client;
const getClient = () => {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
};

const CHAT_SYSTEM = `You are an AI career guidance assistant for Dream Wave AI.
Your job is to understand the user's career goal through a natural conversation.
Ask ONE question at a time. Be warm, encouraging, and concise.
Questions to cover (in natural order, adapt based on answers):
1. What is their main career goal?
2. Their current age or education level?
3. What skills or strengths do they already have?
4. What are their interests or passions?
5. Any experience or projects so far?
After 5 questions, say EXACTLY: "CHAT_COMPLETE" on its own line, then write a brief encouraging closing message.
Never ask more than 5 questions total. Track how many you've asked.`;

const SUMMARY_SYSTEM = `You are a career analysis AI. Analyze the user's goal conversation and return a JSON object with this exact structure:
{
  "careerSuggestion": "Primary career recommendation",
  "alternativeCareers": ["option1", "option2"],
  "strengths": ["strength1", "strength2", "strength3"],
  "areasToImprove": ["area1", "area2"],
  "recommendedPath": "2-3 sentence step-by-step path",
  "timelineEstimate": "e.g. 2-3 years",
  "firstSteps": ["action1", "action2", "action3"],
  "motivationalMessage": "One powerful inspiring sentence"
}
Return ONLY valid JSON. No extra text.`;

// Single AI response
async function generateAIResponse(prompt) {
  const completion = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300,
    temperature: 0.7
  });
  return completion.choices[0].message.content.trim();
}

// Continue goal chat with full history
async function continueGoalChat(messages) {
  const completion = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: CHAT_SYSTEM },
      ...messages
    ],
    max_tokens: 250,
    temperature: 0.75
  });
  return completion.choices[0].message.content.trim();
}

// Generate structured summary from conversation
async function generateGoalSummary(conversationText) {
  const completion = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SUMMARY_SYSTEM },
      { role: 'user', content: `Analyze this career goal conversation:\n\n${conversationText}` }
    ],
    max_tokens: 600,
    temperature: 0.6,
    response_format: { type: 'json_object' }
  });
  return JSON.parse(completion.choices[0].message.content);
}

module.exports = { generateAIResponse, continueGoalChat, generateGoalSummary };
