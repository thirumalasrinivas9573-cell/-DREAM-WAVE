const router      = require('express').Router();
const auth        = require('../middleware/auth');
const OpenAI      = require('openai');
const { analyzeUserGoal } = require('../services/aiService');
const GoalSession = require('../models/GoalSession');
const User        = require('../models/User');

let _client;
const getClient = () => {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
};

const MENTOR_SYSTEM = `You are a calm, intelligent mentor — like a knowledgeable older friend who genuinely cares about the student's growth.

When answering questions, follow this structure:
1. Simple explanation — what it is, in plain everyday language
2. Why it matters — the real reason this is useful or important
3. Example — one concrete, relatable real-life or code example
4. What to do next — one clear action the student can take right now

Tone rules:
- Speak like a human teacher, not a robot or textbook
- Use short, clear sentences
- Avoid jargon — if you must use a technical term, explain it right away
- Be warm, direct, and encouraging
- Use bullet points when listing steps or options
- Keep answers focused — don't pad with unnecessary words
- End every response with: "You're on the right track. Keep going. 💪"

If the question is unclear or you're unsure, say:
"Let's simplify this step-by-step..." and break it down from the very basics.

Always consider the student's context: their goal, current topic, and learning level when crafting your response.`;

// POST /api/ai/chat — free-form personal mentor chat
router.post('/chat', auth, async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message?.trim()) return res.status(400).json({ message: 'Message required' });

  try {
    // Build conversation: system + recent history (last 6 turns) + new message
    const messages = [
      { role: 'system', content: MENTOR_SYSTEM },
      ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message.trim() }
    ];

    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.7
    });

    res.json({ reply: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.warn('AI chat fallback triggered:', err.message);
    const { FALLBACK_AI_CHAT_REPLY } = require('../utils/fallbacks');
    res.json({ reply: FALLBACK_AI_CHAT_REPLY, fallback: true });
  }
});

// POST /api/ai/report — structured career report (JSON)
router.post('/report', auth, async (req, res) => {
  const { goal, level = 'Intermediate', interests = '' } = req.body;
  if (!goal?.trim()) return res.status(400).json({ message: 'Goal required' });

  const prompt = `You are a calm, experienced career mentor writing a personal career report for a student.
Student Goal: ${goal}
Current Level: ${level}
Interests: ${interests || 'Not specified'}

Write this report like a mentor who knows the student — direct, warm, and practical.
Use simple language. Short sentences. No corporate jargon.

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "overview": "2-3 sentences written like a mentor speaking directly to the student. Use 'you'. Be specific to their goal.",
  "skills": ["skill1 — why it matters", "skill2", "skill3", "skill4", "skill5"],
  "roadmap": ["Step 1: ... (timeframe)", "Step 2: ...", "Step 3: ...", "Step 4: ...", "Step 5: ..."],
  "tools": ["tool1 — what it's used for", "tool2", "tool3", "tool4"],
  "challenges": ["challenge1 — and how to handle it", "challenge2", "challenge3"],
  "opportunities": ["opportunity1", "opportunity2", "opportunity3"],
  "dailyPlan": ["Morning: ...", "Afternoon: ...", "Evening: ...", "Weekend: ..."]
}`;

  try {
    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 900,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });
    const report = JSON.parse(completion.choices[0].message.content);
    res.json({ report, goal, level });
  } catch (err) {
    console.warn('AI report fallback triggered:', err.message);
    res.json({
      report: {
        overview: `${goal} is a promising career with strong growth prospects in India and globally.`,
        skills: ['Core technical skills', 'Communication', 'Problem solving', 'Time management', 'Teamwork'],
        roadmap: ['Step 1: Learn fundamentals (1-3 months)', 'Step 2: Build projects (2-4 months)', 'Step 3: Get certified (1-2 months)', 'Step 4: Apply for internships (3-6 months)', 'Step 5: Land first job (1-3 months)'],
        tools: ['Google', 'YouTube', 'Coursera', 'GitHub', 'LinkedIn'],
        challenges: ['Staying consistent', 'Information overload', 'Competition in the market'],
        opportunities: ['Growing demand in India', 'Remote work options', 'Freelancing potential'],
        dailyPlan: ['Morning: 1 hour of learning', 'Afternoon: Practice and projects', 'Evening: Review and plan tomorrow', 'Weekend: Build a project or take a mock test']
      },
      goal, level, fallback: true
    });
  }
});

// POST /api/ai/analyze
// Body: { goal, age, education, skills, interests, experience }
router.post('/analyze', auth, async (req, res) => {
  const { goal, age, education, skills, interests, experience } = req.body;

  if (!goal || !age || !education || !skills || !interests) {
    return res.status(400).json({ message: 'All fields required: goal, age, education, skills, interests' });
  }

  try {
    // Call OpenAI
    const aiAnalysis = await analyzeUserGoal({ goal, age, education, skills, interests, experience });

    // Save session to MongoDB
    const session = await GoalSession.create({
      userId: req.user._id,
      goal,
      answers: { age, education, skills, interests, experience },
      aiAnalysis
    });

    // Update user's goal field
    await User.findByIdAndUpdate(req.user._id, { goal });

    res.json({ sessionId: session._id, aiAnalysis });
  } catch (err) {
    console.error('AI analyze error:', err.message);
    res.status(500).json({ message: 'AI analysis failed', error: err.message });
  }
});

// GET /api/ai/sessions — get user's past goal sessions
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await GoalSession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('goal aiAnalysis createdAt');
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sessions' });
  }
});

// POST /api/ai/learning-plan — structured daily learning plan (uses aiEngine)
router.post('/learning-plan', auth, async (req, res) => {
  const { goal, days = 7, level = 'Beginner' } = req.body;
  if (!goal?.trim()) return res.status(400).json({ success: false, message: 'Goal required' });

  try {
    const aiEngine = require('../services/aiEngine');
    const plan = await aiEngine.generateLearningPlan(goal, parseInt(days) || 7, level);
    res.json({ plan });
  } catch (err) {
    const { getFallbackLearningPlan } = require('../services/aiEngine');
    res.json({ plan: getFallbackLearningPlan(goal, parseInt(days) || 7, level), fallback: true });
  }
});

// POST /api/ai/smart-day — rich daily lesson (uses aiEngine)
router.post('/smart-day', auth, async (req, res) => {
  const { goal, day = 1, level = 'Beginner', completedTopics = [] } = req.body;
  if (!goal?.trim()) return res.status(400).json({ success: false, message: 'Goal required' });

  try {
    const aiEngine = require('../services/aiEngine');
    const lesson = await aiEngine.generateSmartDay(goal, parseInt(day) || 1, level, completedTopics);
    res.json({ lesson, goal, day });
  } catch (err) {
    const { getFallbackSmartDay } = require('../services/aiEngine');
    res.json({ lesson: getFallbackSmartDay(goal, parseInt(day) || 1), goal, day, fallback: true });
  }
});

// POST /api/ai/video-scenes — generate cinematic learning scenes
router.post('/video-scenes', auth, async (req, res) => {
  const { topic } = req.body;
  if (!topic?.trim()) return res.status(400).json({ message: 'Topic required' });

  const prompt = `You are a world-class cinematic director and educational storyteller.
Convert this topic into HIGH-END cinematic animated learning scenes that feel like a movie.

Topic: "${topic}"

GOAL: Create visually stunning, emotionally engaging, and easy-to-understand educational scenes.

STRICT CINEMATIC RULES:
1. Every scene must feel like a movie shot — not a slide or textbook
2. Use strong visual imagination: environment, atmosphere, colors, depth
3. Include specific camera movement (slow zoom in, wide pan, tracking shot, top-down reveal, orbit)
4. Add lighting details (golden glow, dramatic shadows, soft diffused light, neon pulse, sunrise warmth)
5. Add motion description (particles rising, energy flowing, objects transforming, light expanding)
6. Narration: simple, powerful, 1-2 lines max — like a great documentary narrator
7. Each scene builds from the previous — tell a story, not a list
8. Scene 1: cinematic hook that creates curiosity
9. Scenes 2-5: one core concept per scene, each more immersive than the last
10. Scene 6: emotional payoff + key takeaway

MOOD PALETTE — use exactly one per scene:
- "curiosity" → mysterious, deep blues and purples, soft glow
- "excitement" → warm oranges and golds, dynamic energy
- "clarity" → clean whites and cyans, expanding light
- "discovery" → emerald greens and teals, revealing motion
- "wonder" → cosmic purples and pinks, infinite depth
- "triumph" → golden sunrise, rising motion, warm light

Return ONLY valid JSON (no markdown, no extra text):
{
  "title": "Cinematic lesson title",
  "scenes": [
    {
      "id": 1,
      "title": "Short cinematic title (4-6 words)",
      "description": "2-3 sentences. Clear, simple explanation. Written like a great teacher.",
      "visual": "Highly detailed cinematic visual — environment, objects, colors, atmosphere, depth. 2-3 sentences.",
      "camera": "Specific camera movement e.g. 'Slow zoom in from wide establishing shot to close-up'",
      "animation": "What moves in the scene e.g. 'Golden particles rise and spiral upward, light expands outward'",
      "lighting": "Lighting style e.g. 'Soft golden backlight with deep violet shadows and glowing edges'",
      "mood": "curiosity | excitement | clarity | discovery | wonder | triumph",
      "narration": "Exactly what the narrator says — 1-2 powerful, simple sentences. Conversational, not academic.",
      "subtitle": "Ultra-short subtitle version (max 8 words)",
      "duration": "4",
      "transition": "fade | zoom | dissolve | slide",
      "icon": "One perfectly matching emoji",
      "gradient": "#hexcolor1,#hexcolor2"
    }
  ]
}

QUALITY RULES:
- Use sensory words: glowing, flowing, expanding, rising, pulsing, dissolving, igniting
- Make scenes feel alive — not static
- Narration must sound powerful when spoken aloud
- Each gradient must match the mood (dark cosmic for curiosity, warm gold for triumph, etc.)`;

  try {
    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1800,
      temperature: 0.82,
      response_format: { type: 'json_object' }
    });
    const data = JSON.parse(completion.choices[0].message.content);
    res.json({ title: data.title, scenes: data.scenes || [], topic });
  } catch (err) {
    console.warn('Video scenes fallback:', err.message);
    res.json({
      title: `The Story of ${topic}`,
      topic,
      fallback: true,
      scenes: [
        { id: 1, title: `The World Before ${topic}`, description: `Before we understood ${topic}, the world looked very different. Something was missing — a key that would unlock a whole new way of seeing.`, visual: `A vast dark cosmos slowly illuminated by a single point of light expanding outward, deep violet and indigo atmosphere, stars emerging from darkness`, camera: 'Slow zoom out from darkness to reveal a glowing universe', animation: 'Single point of light expands into a glowing sphere, particles spiral outward', lighting: 'Deep darkness with a single warm golden glow at center, soft violet edges', mood: 'curiosity', narration: `Before ${topic} was understood, this question had no answer. Today, we change that.`, subtitle: `The question that started everything`, duration: '4', transition: 'fade', icon: '🌌', gradient: '#0a0520,#1a0a3e' },
        { id: 2, title: 'The Core Idea', description: `At its heart, ${topic} is one elegant idea. Once you see it clearly, everything else falls into place.`, visual: `A glowing geometric shape forms in the center of the frame, surrounded by flowing light streams, warm amber and gold tones against deep space`, camera: 'Tracking shot circling the central glowing object, slowly tightening', animation: 'Geometric form assembles piece by piece, each piece arriving with a pulse of light', lighting: 'Warm golden backlight, soft diffused glow, dramatic depth shadows', mood: 'discovery', narration: `Here's the core idea — and it's more elegant than you'd expect.`, subtitle: `One idea that changes everything`, duration: '4', transition: 'zoom', icon: '💡', gradient: '#1a0820,#2d1040' },
        { id: 3, title: 'How It Actually Works', description: `${topic} follows a beautiful sequence. Each step flows naturally into the next, like a river finding its path.`, visual: `A flowing river of light energy moving through a dark landscape, branching and connecting, emerald and teal streams against deep black`, camera: 'Wide establishing shot then slow pan following the flow of energy', animation: 'Energy streams flow and branch, connecting nodes that light up in sequence', lighting: 'Soft emerald glow with teal highlights, deep shadows on either side', mood: 'clarity', narration: `Watch how it works — step by step, each part connecting to the next.`, subtitle: `Step by step, it all connects`, duration: '4', transition: 'dissolve', icon: '⚡', gradient: '#051a10,#0a2820' },
        { id: 4, title: 'You See It Every Day', description: `${topic} isn't just theory. It's happening around you right now — you just didn't have a name for it.`, visual: `Split screen: abstract concept on left transforms into a real-world scene on right, warm sunrise colors, everyday objects glowing with new meaning`, camera: 'Smooth horizontal pan from abstract to real world, depth of field shift', animation: 'Abstract shapes morph into recognizable real-world objects, glowing edges', lighting: 'Golden sunrise warmth, soft lens flare, warm amber atmosphere', mood: 'excitement', narration: `You've seen this before. Now you know exactly what you were looking at.`, subtitle: `It was always around you`, duration: '4', transition: 'slide', icon: '🌍', gradient: '#1a0a00,#2d1500' },
        { id: 5, title: 'Why This Changes Everything', description: `Understanding ${topic} doesn't just answer one question. It opens a door to a hundred more — and gives you the tools to answer them.`, visual: `A single door of light opens in a dark void, revealing an infinite corridor of glowing doorways stretching to the horizon, cosmic purple and pink`, camera: 'First-person tracking shot moving forward through opening doors', animation: 'Doors open in sequence, each revealing brighter light, particles trail behind', lighting: 'Dramatic backlight through each doorway, deep purple shadows, pink highlights', mood: 'wonder', narration: `This is why ${topic} matters — it doesn't just explain one thing. It explains everything connected to it.`, subtitle: `One answer, infinite doors`, duration: '4', transition: 'zoom', icon: '🚀', gradient: '#0f0520,#1a0535' },
        { id: 6, title: 'You Now Understand This', description: `You came in with a question. You're leaving with an answer — and the confidence to go deeper.`, visual: `A student silhouette stands on a mountain peak at golden sunrise, light expanding across the horizon, warm gold and amber sky, triumphant atmosphere`, camera: 'Slow crane shot rising from behind the figure to reveal the full sunrise panorama', animation: 'Light expands across the horizon, golden rays rise, particles float upward', lighting: 'Full golden sunrise, warm backlight, soft lens flare, triumphant warmth', mood: 'triumph', narration: `You now understand ${topic}. That's not a small thing. You're on the right track — keep going. 💪`, subtitle: `You've got this. Keep going.`, duration: '5', transition: 'fade', icon: '✨', gradient: '#1a0800,#2d1500' },
      ]
    });
  }
});

// POST /api/ai/video-prompt — cinematic video prompt generator for Pika
router.post('/video-prompt', auth, async (req, res) => {
  const { topic, style = 'Realistic' } = req.body;
  if (!topic?.trim()) return res.status(400).json({ message: 'Topic required' });

  // Expand very short inputs
  const expandedTopic = topic.trim().length < 5
    ? `${topic.trim()} — detailed educational concept visualization`
    : topic.trim();

  const styleGuides = {
    'Realistic':    'photorealistic, ultra-detailed, cinematic film quality',
    'Cartoon':      'vibrant cartoon animation, Pixar-style, colorful and playful',
    'Educational':  'clean whiteboard animation, infographic style, clear labels and diagrams',
    'Krishna Style':'divine Indian classical art style, golden hues, lotus flowers, cosmic background',
  };
  const styleHint = styleGuides[style] || styleGuides['Realistic'];

  const prompt = `You are an expert video prompt engineer for AI video generation tools like Pika Labs.
Convert this topic into a HIGH-QUALITY cinematic animation prompt.

Topic: "${expandedTopic}"
Requested Style: ${style} (${styleHint})

Rules:
- Make it visually rich, specific, and descriptive (50-80 words)
- Include camera movement (slow zoom, pan, orbit, etc.)
- Include environment and setting details
- Include lighting description (golden hour, neon, soft diffused, etc.)
- Include mood and atmosphere
- Keep it educational and visually engaging
- Use vivid, cinematic imagery

Return ONLY valid JSON (no markdown):
{
  "video_prompt": "Main visual description of the scene and action",
  "style": "Visual style description",
  "camera": "Camera movement and angle",
  "lighting": "Lighting setup and atmosphere",
  "mood": "Emotional tone and atmosphere"
}`;

  try {
    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });
    const result = JSON.parse(completion.choices[0].message.content);
    const finalPrompt = `${result.video_prompt}, Style: ${result.style}, Camera: ${result.camera}, Lighting: ${result.lighting}, Mood: ${result.mood}, cinematic smooth animation, 4K, educational`;
    res.json({ ...result, finalPrompt, topic: expandedTopic, style });
  } catch (err) {
    console.warn('Video prompt fallback:', err.message);
    const fallback = `Educational animation explaining ${expandedTopic} with simple visuals, smooth camera pan across glowing diagrams, soft blue ambient lighting, clean and modern style, cinematic smooth animation, 4K, educational`;
    res.json({
      video_prompt: `Cinematic visualization of ${expandedTopic} with glowing particles and flowing energy`,
      style: styleHint,
      camera: 'Slow cinematic zoom-in with gentle orbit',
      lighting: 'Soft blue ambient light with golden highlights',
      mood: 'Inspiring, educational, and visually captivating',
      finalPrompt: fallback,
      topic: expandedTopic,
      style,
      fallback: true
    });
  }
});

module.exports = router;
