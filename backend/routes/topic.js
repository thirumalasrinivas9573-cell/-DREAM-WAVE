const express = require('express');
const router = express.Router();
// MongoDB removed for demo mode. No model needed.

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

// POST /api/topic-content
router.post('/', async (req, res) => {
  try {
    const { topic } = req.body || {};
    if (!topic) return res.status(400).json({ message: 'Topic is required' });
    const content = buildTopicContent(topic);
    const doc = await Topic.create({ topic, content });
    res.json({ content, id: doc._id });
  } catch (err) {
    res.status(500).json({ message: 'Error generating topic content', error: err.message });
  }
});

module.exports = router;
