const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

async function callAI(prompt, maxTokens = 2000) {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: maxTokens, temperature: 0.7 })
  });
  if (!res.ok) throw new Error('OpenAI error');
  const data = await res.json();
  return data.choices[0].message.content;
}

// Analyze syllabus and generate exam prep content
router.post('/analyze', auth, async (req, res) => {
  try {
    const { subject, classLevel, syllabus } = req.body;
    if (!subject || !syllabus) return res.status(400).json({ message: 'Subject and syllabus required' });

    const prompt = `You are an expert exam preparation assistant.
Subject: "${subject}"
Class/Level: "${classLevel || 'General'}"
Syllabus: "${syllabus}"

Analyze this syllabus and return ONLY valid JSON:
{
  "subject": "${subject}",
  "topics": [
    {
      "id": "t1",
      "title": "Topic Name",
      "importance": "high|medium|low",
      "description": "Brief description",
      "subtopics": ["subtopic1", "subtopic2"]
    }
  ],
  "importantConcepts": ["Concept 1", "Concept 2", "Concept 3"],
  "predictedQuestions": [
    {
      "question": "Question text?",
      "type": "short|long|mcq",
      "marks": 5,
      "topic": "Related topic",
      "importance": "high|medium"
    }
  ],
  "studyTips": ["Tip 1", "Tip 2", "Tip 3"],
  "timeAllocation": "Study plan suggestion"
}
Extract 5-8 topics, 5-10 important concepts, 10-15 predicted questions. Focus on high-importance items.`;

    let analysis;
    try {
      const raw = await callAI(prompt, 2500);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch(e) {
      analysis = {
        subject,
        topics: [{ id: 't1', title: 'Core Concepts', importance: 'high', description: 'Fundamental concepts', subtopics: ['Basic principles', 'Applications'] }],
        importantConcepts: ['Key concept 1', 'Key concept 2', 'Key concept 3'],
        predictedQuestions: [
          { question: `Explain the main concepts of ${subject}?`, type: 'long', marks: 10, topic: 'Core Concepts', importance: 'high' },
          { question: `What are the key principles of ${subject}?`, type: 'short', marks: 5, topic: 'Core Concepts', importance: 'high' }
        ],
        studyTips: ['Focus on high-importance topics first', 'Practice past papers', 'Make concise notes'],
        timeAllocation: 'Spend 60% time on high-importance topics, 30% on medium, 10% on low'
      };
    }

    res.json({ analysis });
  } catch(err) {
    res.status(500).json({ message: 'Error analyzing syllabus', error: err.message });
  }
});

// Generate detailed Q&A for a topic
router.post('/generate-qa', auth, async (req, res) => {
  try {
    const { topic, subject, count = 10, type = 'mixed' } = req.body;
    if (!topic) return res.status(400).json({ message: 'Topic required' });

    const prompt = `Generate ${count} exam questions with detailed answers for:
Topic: "${topic}"
Subject: "${subject || topic}"
Type: ${type} (short/long/mcq/mixed)

Return ONLY valid JSON array:
[
  {
    "id": "q1",
    "question": "Question text?",
    "type": "short|long|mcq",
    "marks": 5,
    "answer": "Detailed answer",
    "keyPoints": ["Key point 1", "Key point 2"],
    "diagram": false,
    "diagramDescription": ""
  }
]
Make questions exam-realistic. Answers should be comprehensive and well-structured.`;

    let qa;
    try {
      const raw = await callAI(prompt, 2000);
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      qa = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch(e) {
      qa = [
        { id: 'q1', question: `Define and explain ${topic}`, type: 'short', marks: 5, answer: `${topic} refers to the fundamental concepts and principles in this area. It encompasses the core ideas that form the basis of understanding.`, keyPoints: ['Definition', 'Key characteristics', 'Applications'], diagram: false },
        { id: 'q2', question: `Describe the importance of ${topic} with examples`, type: 'long', marks: 10, answer: `${topic} is important because it forms the foundation of understanding in this subject. Examples include practical applications in real-world scenarios.`, keyPoints: ['Importance', 'Examples', 'Real-world applications'], diagram: false }
      ];
    }

    res.json({ questions: qa, topic, subject });
  } catch(err) {
    res.status(500).json({ message: 'Error generating Q&A', error: err.message });
  }
});

// Answer a specific question
router.post('/answer', auth, async (req, res) => {
  try {
    const { question, subject, context } = req.body;
    if (!question) return res.status(400).json({ message: 'Question required' });

    const prompt = `You are an expert teacher. Answer this exam question comprehensively:
Question: "${question}"
Subject: "${subject || 'General'}"
${context ? `Context: ${context}` : ''}

Provide a detailed, well-structured answer suitable for an exam. Include:
- Clear explanation
- Key points
- Examples where relevant
- Diagrams description if needed

Format your answer clearly with proper structure.`;

    let answer;
    try {
      answer = await callAI(prompt, 1000);
    } catch(e) {
      answer = `This question relates to ${subject || 'the subject'}. A comprehensive answer would cover the key concepts, their applications, and relevant examples. Please refer to your textbook for detailed information.`;
    }

    res.json({ answer, question });
  } catch(err) {
    res.status(500).json({ message: 'Error generating answer', error: err.message });
  }
});

module.exports = router;
