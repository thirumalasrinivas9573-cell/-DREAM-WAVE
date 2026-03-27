require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Global middleware MUST be before routes
app.use(cors());
app.use(express.json());

// AI CHAT API (Production)
app.post('/chat', async (req, res) => {
  try {
    console.log('REQUEST RECEIVED:', req.body);
    if (!req.body.message) {
      // Generate report from raw body
      const userData = req.body;
      const { goal, name, class: cls, age, skills } = userData;
      const prompt = `Generate a detailed 10-section career roadmap report based on:

Name: ${name}
Goal: ${goal}
Class: ${cls}
Age: ${age}
Skills: ${skills}

The report must include:
1. Introduction
2. Current Assessment
3. Career Path Overview
4. Step-by-Step Roadmap
5. Skills to Develop
6. Learning Resources
7. Daily Plan
8. Timeline
9. Challenges & Solutions
10. Final Motivation

Format as structured text with clear section headers.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      const reportText = data.choices?.[0]?.message?.content;
      return res.json({ report: reportText });
    } else {
      // Normal chat
      const { message } = req.body;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: message }]
        })
      });
      console.log('OPENAI RESPONSE STATUS (chat):', response.status);
      if (!response.ok) {
        const txt = await response.text().catch(() => '');
        console.error('OPENAI ERROR (chat):', txt);
        return res.status(502).json({ error: 'AI provider error' });
      }
      const data = await response.json();
      const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!content) {
        console.error('OPENAI MISSING CONTENT (chat):', data);
        return res.status(502).json({ error: 'Empty AI response' });
      }
      res.json({ reply: content });
    }
  } catch (error) {
    console.error('SERVER ERROR /chat:', error);
    res.status(500).json({ error: 'AI server error' });
  }
});

// HEALTH CHECK (Production)
app.get('/', (req, res) => {
  res.send('Server running successfully');
});

// In-memory stores
let roadmapStore = {};
let topicStore = {};

// Static frontend
app.use(express.static(path.join(__dirname, '../frontend')));
// Static audio
app.use('/audio', express.static(path.join(__dirname, '../public/audio')));

// Health
app.get('/health', (req, res) => {
  res.send('Server running');
});

// Builders
function buildRoadmap(goal) {
  return {
    goal,
    overview: `A practical learning roadmap to master ${goal}.`,
    duration: '12-24 weeks',
    phases: [
      {
        phase: 1,
        title: 'Foundation',
        duration: '4-6 weeks',
        description: `Build strong fundamentals of ${goal}.`,
        topics: [
          { id: 'f1', title: `${goal} Basics`, description: 'Core concepts and terms', duration: '1-2 weeks', type: 'reading', resources: ['Official docs', 'Intro course'] },
          { id: 'f2', title: 'Hands-on Practice', description: 'Simple exercises and mini tasks', duration: '1-2 weeks', type: 'practice', resources: ['Practice sets', 'Tutorials'] }
        ]
      },
      {
        phase: 2,
        title: 'Intermediate',
        duration: '4-8 weeks',
        description: `Apply ${goal} concepts in real scenarios.`,
        topics: [
          { id: 'i1', title: 'Advanced Concepts', description: 'Deeper understanding and patterns', duration: '2-3 weeks', type: 'reading', resources: ['Books', 'Advanced guides'] },
          { id: 'i2', title: 'Project Building', description: 'Build a meaningful project', duration: '2-4 weeks', type: 'project', resources: ['Sample apps', 'Templates'] }
        ]
      },
      {
        phase: 3,
        title: 'Advanced',
        duration: '4-10 weeks',
        description: `Specialize and polish your ${goal} skills.`,
        topics: [
          { id: 'a1', title: 'Specialization', description: 'Choose a niche and go deep', duration: '2-4 weeks', type: 'practice', resources: ['Specialization courses'] },
          { id: 'a2', title: 'Portfolio & Readiness', description: 'Polish portfolio and prepare for opportunities', duration: '2-3 weeks', type: 'project', resources: ['Checklists', 'Review guides'] }
        ]
      }
    ],
    skills: ['Fundamentals', 'Problem Solving', 'Projects', 'Communication'],
    resources: ['Official Documentation', 'Community Forums', 'YouTube Tutorials']
  };
}

function buildTopicContent(topic) {
  return {
    title: topic,
    introduction: `${topic} is a key concept that helps you understand core principles and apply them effectively.`,
    keyPoints: [
      `${topic} definition and scope`,
      `Why ${topic} matters`,
      `Common pitfalls in ${topic}`,
      `Best practices for ${topic}`,
      `Real-world applications of ${topic}`
    ],
    explanation: `${topic} involves understanding the foundational theory and practicing it with progressively complex examples. Start small, validate your understanding, and iterate.`,
    examples: [
      { title: `Basic ${topic} Example`, content: `A simple demonstration showing the essentials of ${topic}.` },
      { title: `Advanced ${topic} Example`, content: `A more complex scenario where ${topic} is applied in a realistic context.` }
    ],
    practiceQuestions: [
      `What is ${topic}?`,
      `Explain a use case for ${topic}.`,
      `List best practices for ${topic}.`
    ],
    notes: `Practice ${topic} consistently. Focus on clarity over complexity.`,
    resources: ['Official Docs', 'High-quality tutorials', 'Reference guides']
  };
}

// APIs
app.post('/api/roadmap', (req, res, next) => {
  try {
    const { goal } = req.body || {};
    if (!goal) return res.status(400).json({ message: 'Goal is required' });
    const roadmap = buildRoadmap(goal);
    roadmapStore.latest = roadmap;
    roadmapStore[goal.toLowerCase()] = roadmap;
    res.json({ roadmap });
  } catch (err) {
    next(err);
  }
});

app.get('/api/roadmap', (req, res, next) => {
  try {
    const { goal } = req.query || {};
    if (goal && roadmapStore[goal.toLowerCase()]) {
      return res.json({ roadmap: roadmapStore[goal.toLowerCase()] });
    }
    res.json({ roadmap: roadmapStore.latest || null });
  } catch (err) {
    next(err);
  }
});

app.post('/api/topic-content', (req, res, next) => {
  try {
    const { topic } = req.body || {};
    if (!topic) return res.status(400).json({ message: 'Topic is required' });
    const content = buildTopicContent(topic);
    topicStore[topic.toLowerCase()] = content;
    res.json({ content });
  } catch (err) {
    next(err);
  }
});

// Fallback root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

// Errors
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(500).json({ message: 'Server error', error: err && err.message ? err.message : 'Unknown error' });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

// SERVER START (Step 5)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on ' + PORT));
