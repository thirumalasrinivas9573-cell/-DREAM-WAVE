const OpenAI = require('openai');

let _client;
const getClient = () => {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
};

const SYSTEM = `You are a calm, experienced Indian career counselor who speaks like a trusted mentor — not a corporate consultant.
Write like you're talking directly to the student. Use "you". Be specific, practical, and encouraging.
Return ONLY a valid JSON object. No markdown, no extra text, just raw JSON.`;

async function generateRoadmap(userData) {
  const prompt = `Generate a detailed, personalized career roadmap for this student.

Goal: ${userData.goal}
Age: ${userData.age || 'Not specified'}
Education: ${userData.education || 'Not specified'}
Current Skills: ${userData.skills || 'Not specified'}
Interests: ${userData.interests || 'Not specified'}

Write this roadmap like a mentor who knows the student personally.
- Use simple, clear language
- Be specific to their goal — no generic advice
- Each step should feel achievable, not overwhelming
- Include real Indian college names, real exam names, real platforms
- Tips should feel personal and encouraging

Return a JSON object with EXACTLY this structure:
{
  "currentStage": "One honest sentence about where the student is right now — be direct but kind",
  "overview": "2-3 sentences written like a mentor speaking to the student. Use 'you'. Be specific to their goal.",
  "nextSteps": [
    { "step": 1, "title": "Step title", "description": "What to do and why — written like advice from a friend", "duration": "e.g. 1-2 months" }
  ],
  "skills": [
    { "name": "Skill name", "level": "Beginner/Intermediate/Advanced", "priority": "High/Medium/Low", "resources": "Specific place to learn this" }
  ],
  "courses": [
    { "name": "Course name", "platform": "Coursera/Udemy/YouTube/etc", "cost": "Free/Paid/₹amount", "duration": "X weeks/months", "link": "" }
  ],
  "colleges": [
    { "name": "College name", "type": "Government/Private", "location": "City, State", "fees": "Annual fees approx", "ranking": "NIRF/other rank" }
  ],
  "exams": [
    { "name": "Exam name", "type": "Entrance/Certification/Competitive", "eligibility": "Who can apply", "frequency": "Annual/Biannual", "importance": "High/Medium" }
  ],
  "timeline": [
    { "period": "Month 1-3", "focus": "What to focus on", "goal": "Specific milestone to hit" }
  ],
  "milestones": [
    { "title": "Milestone title", "timeframe": "e.g. 6 months", "description": "What success looks like at this point" }
  ],
  "salaryProgression": [
    { "stage": "Entry Level", "experience": "0-2 years", "salary": "₹X - ₹Y LPA" }
  ],
  "tips": ["Personal, specific tip 1", "Tip 2", "Tip 3 — end with encouragement"]
}

Keep nextSteps to 6-8 items, timeline to 8-10 periods, milestones to 5-6 items.`;

  const completion = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user',   content: prompt }
    ],
    max_tokens: 3000,
    temperature: 0.65,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(completion.choices[0].message.content);
}

module.exports = { generateRoadmap };
