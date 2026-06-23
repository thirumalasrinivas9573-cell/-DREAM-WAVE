const OpenAI = require('openai');
const { FALLBACK_CHAT_MESSAGE, FALLBACK_GOAL_SUMMARY } = require('../utils/fallbacks');

let _client;
const getClient = () => {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
};

const CHAT_SYSTEM = `You are a calm, intelligent mentor on Dream Wave AI — like a knowledgeable older friend who genuinely wants to help.

Your job is to understand the user's career goal through a warm, natural conversation.
Ask ONE question at a time. Be encouraging, clear, and human.

Tone rules:
- Speak like a real person, not a robot
- Use simple, everyday language
- Keep sentences short and easy to read
- Acknowledge what the user says before asking the next question
- Give a small word of encouragement after each answer

Questions to cover (adapt naturally based on answers):
1. What is their main career goal?
2. Their current age or education level?
3. What skills or strengths do they already have?
4. What are their interests or passions?
5. Any experience or projects so far?

After 5 questions, say EXACTLY: "CHAT_COMPLETE" on its own line, then write a warm, personal closing message that references what they shared.
Never ask more than 5 questions total.`;

const SUMMARY_SYSTEM = `You are a career analysis expert who writes like a supportive mentor, not a corporate report.
Analyze the user's goal conversation and return a JSON object with this exact structure:
{
  "careerSuggestion": "Primary career recommendation — be specific",
  "alternativeCareers": ["option1", "option2"],
  "strengths": ["strength1", "strength2", "strength3"],
  "areasToImprove": ["area1", "area2"],
  "recommendedPath": "2-3 sentences written like a mentor giving personal advice — use 'you' and be direct",
  "timelineEstimate": "e.g. 2-3 years",
  "firstSteps": ["Concrete action 1 — start this week", "action2", "action3"],
  "motivationalMessage": "One warm, personal sentence that feels like it was written just for them"
}
Return ONLY valid JSON. No extra text.`;

async function continueGoalChat(messages) {
  try {
    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: CHAT_SYSTEM }, ...messages],
      max_tokens: 250,
      temperature: 0.75
    });
    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.warn('OpenAI chat fallback triggered:', err.message);
    return FALLBACK_CHAT_MESSAGE;
  }
}

async function generateGoalSummary(conversationText) {
  try {
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
  } catch (err) {
    console.warn('OpenAI summary fallback triggered:', err.message);
    return FALLBACK_GOAL_SUMMARY;
  }
}

module.exports = { continueGoalChat, generateGoalSummary };
