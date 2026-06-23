const OpenAI = require('openai');
const { FALLBACK_MENTOR_REPLY } = require('../utils/fallbacks');
const { MENTOR_PROMPT }         = require('../ai/prompts/mentorPrompt');
const { getMemory, updateMemory, buildContextString, detectEmotion } = require('../services/memoryService');

let _client;
const getClient = () => {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
};

exports.ask = async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ message: 'Message required' });

  // Load memory + detect emotion
  const memory         = await getMemory(req.user._id);
  const detectedEmotion = detectEmotion(message);
  const memoryContext  = buildContextString(memory);

  const userData = {
    name:  req.user?.name,
    goal:  memory.goal  || req.user?.goal,
    level: memory.level || (req.user?.level ? `Level ${req.user.level}` : undefined),
    state: detectedEmotion !== 'Normal' ? detectedEmotion : memory.emotionalState,
  };

  try {
    const systemPrompt = MENTOR_PROMPT(userData, message) + memoryContext;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map(m => ({
        role:    m.role === 'ai' ? 'assistant' : 'user',
        content: m.text,
      })),
      { role: 'user', content: message },
    ];

    const completion = await getClient().chat.completions.create({
      model:       'gpt-4o-mini',
      messages,
      max_tokens:  500,
      temperature: 0.82,
    });

    const reply = completion.choices[0].message.content.trim();

    // Save emotional state + last topic (non-blocking)
    updateMemory(req.user._id, {
      emotionalState: detectedEmotion,
      lastTopics:     [message.slice(0, 60)],
    }).catch(() => {});

    res.json({ reply });
  } catch (err) {
    console.warn('Mentor fallback triggered:', err.message);
    res.json({ reply: FALLBACK_MENTOR_REPLY, fallback: true });
  }
};
