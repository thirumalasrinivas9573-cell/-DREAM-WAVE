const OpenAI = require('openai');

let _client;
const getClient = () => {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
};

const SYSTEM = `You are an expert Indian career counselor and roadmap planner.
Return ONLY a valid JSON object. No markdown, no extra text, just raw JSON.`;

async function generateRoadmap(userData) {
  const prompt = `Generate a detailed, structured career roadmap for this user.

Goal: ${userData.goal}
Age: ${userData.age || 'Not specified'}
Education: ${userData.education || 'Not specified'}
Current Skills: ${userData.skills || 'Not specified'}
Interests: ${userData.interests || 'Not specified'}

Return a JSON object with EXACTLY this structure:
{
  "currentStage": "One sentence describing where the user is now",
  "overview": "2-3 sentence summary of the career path",
  "nextSteps": [
    { "step": 1, "title": "Step title", "description": "What to do", "duration": "e.g. 1-2 months" }
  ],
  "skills": [
    { "name": "Skill name", "level": "Beginner/Intermediate/Advanced", "priority": "High/Medium/Low", "resources": "Where to learn" }
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
    { "period": "Month 1-3", "focus": "What to focus on", "goal": "Milestone to achieve" }
  ],
  "milestones": [
    { "title": "Milestone title", "timeframe": "e.g. 6 months", "description": "What success looks like" }
  ],
  "salaryProgression": [
    { "stage": "Entry Level", "experience": "0-2 years", "salary": "₹X - ₹Y LPA" }
  ],
  "tips": ["Practical tip 1", "Practical tip 2", "Practical tip 3"]
}

Make it specific to India. Include real college names, real exam names (JEE, NEET, GATE, CAT, EAMCET, etc.), real platforms. Keep nextSteps to 6-8 items, timeline to 8-10 periods, milestones to 5-6 items.`;

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
