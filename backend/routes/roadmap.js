const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

async function callAI(prompt, maxTokens = 1500) {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7
    })
  });
  if (!res.ok) throw new Error('OpenAI error');
  const data = await res.json();
  return data.choices[0].message.content;
}

// POST /api/roadmap (generate roadmap - textual structured output)
router.post('/', auth, async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ error: 'Goal required' });
    const prompt = `Generate a detailed learning roadmap for the goal: "${goal}". Include:\n - Overview\n - Duration\n - Weekly and daily tasks\n - Phases\n - Key topics\n Return in structured format.`;
    const roadmapText = await callAI(prompt, 1800);
    let data;
    try {
      data = JSON.parse(roadmapText);
    } catch (_) {
      data = { content: roadmapText };
    }
    const doc = await Roadmap.create({ goal, data });
    res.json({ roadmap: roadmapText, id: doc._id });
  } catch (e) {
    res.status(500).json({ error: 'Roadmap AI error', details: e.message });
  }
});

// POST /api/roadmap/generate (generate structured JSON roadmap and persist on user)
router.post('/generate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const goal = req.body.goal || (user && (user.goal || user.ambition));
    if (!goal) return res.status(400).json({ message: 'Goal required' });

    const prompt = `Create a detailed learning roadmap for: "${goal}"\nReturn ONLY valid JSON, no markdown:\n{\n  "goal": "${goal}",\n  "overview": "2-3 sentence description of this career path",\n  "duration": "estimated total time e.g. 12-18 months",\n  "phases": [\n    {\n      "phase": 1,\n      "title": "Foundation",\n      "duration": "3 months",\n      "description": "What this phase covers",\n      "topics": [\n        {\n          "id": "topic-1",\n          "title": "Topic Name",\n          "description": "What you will learn",\n          "duration": "1 week",\n          "type": "reading|video|practice|project",\n          "resources": ["Resource 1", "Resource 2"]\n        }\n      ]\n    }\n  ],\n  "skills": ["skill1", "skill2"],\n  "careerPaths": ["Path 1", "Path 2"],\n  "salaryRange": "Entry: X - Expert: Y"\n}\nInclude 3 phases (Foundation, Intermediate, Advanced), 3-4 topics per phase. Be specific to "${goal}".`;

    let roadmap;
    try {
      const raw = await callAI(prompt, 2000);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      roadmap = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch (e) {
      roadmap = {
        goal,
        overview: `A comprehensive learning path to become a ${goal}. This roadmap covers all essential skills from beginner to advanced level.`,
        duration: '12-18 months',
        phases: [
          { phase: 1, title: 'Foundation', duration: '3 months', description: 'Core fundamentals and basics', topics: [
            { id: 't1', title: `${goal} Fundamentals`, description: 'Core concepts and principles', duration: '3 weeks', type: 'reading', resources: ['Online courses', 'Documentation'] },
            { id: 't2', title: 'Practical Basics', description: 'Hands-on practice with basics', duration: '3 weeks', type: 'practice', resources: ['Practice exercises', 'Projects'] }
          ]},
          { phase: 2, title: 'Intermediate', duration: '6 months', description: 'Building real skills', topics: [
            { id: 't3', title: 'Advanced Concepts', description: 'Deeper understanding', duration: '6 weeks', type: 'reading', resources: ['Books', 'Tutorials'] },
            { id: 't4', title: 'Real Projects', description: 'Build portfolio projects', duration: '6 weeks', type: 'project', resources: ['GitHub', 'Portfolio'] }
          ]},
          { phase: 3, title: 'Advanced', duration: '6 months', description: 'Expert-level mastery', topics: [
            { id: 't5', title: 'Specialization', description: 'Pick your niche', duration: '8 weeks', type: 'practice', resources: ['Specialization courses'] },
            { id: 't6', title: 'Industry Ready', description: 'Job preparation', duration: '4 weeks', type: 'project', resources: ['Interview prep', 'Portfolio review'] }
          ]}
        ],
        skills: ['Core technical skills', 'Problem solving', 'Communication', 'Project management'],
        careerPaths: ['Junior role', 'Mid-level', 'Senior', 'Freelance'],
        salaryRange: 'Entry: ₹3-6 LPA - Expert: ₹15-30+ LPA'
      };
    }

    await User.findByIdAndUpdate(req.userId, { roadmap });
    res.json({ roadmap });
  } catch (err) {
    res.status(500).json({ message: 'Error generating roadmap', error: err.message });
  }
});

// GET /api/roadmap - fetch saved roadmap
router.get('/', auth, async (req, res) => {
  try {
    const { goal } = req.query || {};
    if (goal) {
      const item = await Roadmap.findOne({ goal }).sort({ createdAt: -1 });
      return res.json({ roadmap: item || null });
    }
    const latest = await Roadmap.findOne().sort({ createdAt: -1 });
    res.json({ roadmap: latest || null });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/roadmap/topic-content - generate topic content
router.post('/topic-content', auth, async (req, res) => {
  try {
    const { topic, goal } = req.body;
    if (!topic) return res.status(400).json({ message: 'Topic required' });

    const prompt = `Create detailed educational content for the topic: "${topic}" in the context of learning "${goal || 'the subject'}".\n\nReturn ONLY valid JSON:\n{\n  "title": "${topic}",\n  "introduction": "2-3 paragraph introduction",\n  "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],\n  "explanation": "Detailed explanation (3-4 paragraphs)",\n  "examples": [\n    { "title": "Example 1", "content": "Detailed example" },\n    { "title": "Example 2", "content": "Detailed example" }\n  ],\n  "practiceQuestions": ["Question 1?", "Question 2?", "Question 3?"],\n  "notes": "Important notes and tips",\n  "resources": ["Resource 1", "Resource 2", "Resource 3"]\n}`;

    let content;
    try {
      const raw = await callAI(prompt, 1500);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      content = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch (e) {
      content = {
        title: topic,
        introduction: `${topic} is a fundamental concept in ${goal || 'this field'}. Understanding it thoroughly will help you build a strong foundation for your career journey.`,
        keyPoints: ['Core concept 1', 'Core concept 2', 'Core concept 3', 'Practical application', 'Best practices'],
        explanation: `${topic} involves understanding the core principles and applying them in real-world scenarios. This topic is essential for anyone pursuing ${goal || 'this career path'}.`,
        examples: [
          { title: 'Basic Example', content: `A simple example of ${topic} in practice.` },
          { title: 'Advanced Example', content: `A more complex application of ${topic}.` }
        ],
        practiceQuestions: [`What is ${topic}?`, `How do you apply ${topic}?`, `What are the best practices for ${topic}?`],
        notes: `Remember to practice ${topic} regularly. Consistency is key to mastery.`,
        resources: ['Online documentation', 'YouTube tutorials', 'Practice exercises']
      };
    }

    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: 'Error generating content', error: err.message });
  }
});

// POST /api/roadmap (content builder by topic)
router.post('/roadmap', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const content = {
      introduction: `${topic} is an important concept`,
      keyPoints: ['Core concept 1', 'Core concept 2'],
      explanation: `${topic} involves detailed understanding`,
      examples: [
        { title: 'Basic Example', content: 'Simple explanation' },
        { title: 'Advanced Example', content: 'Detailed explanation' }
      ],
      practiceQuestions: [`What is ${topic}?`],
      notes: `Remember to practice ${topic}`,
      resources: ['Online documentation']
    };

    res.json({ content });
  } catch (err) {
    res.status(500).json({
      message: 'Error generating content',
      error: err.message
    });
  }
});

module.exports = router;
