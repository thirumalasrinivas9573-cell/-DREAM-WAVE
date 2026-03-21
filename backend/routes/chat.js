const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

function openAIHeaders() {
  return {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  };
}

// ─── REGULAR CHAT (max 800 tokens) ───────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { message, context } = req.body;
    const user = await User.findById(req.userId);

    const systemPrompt = `You are an AI Career Intelligence Engine for Dream Wave — a platform combining ChatGPT, LinkedIn, Coursera, and Instagram for career guidance.

You have deep knowledge about ALL professions including:
- TECH: Software Engineer, AI Engineer, Web Developer, App Developer, Data Scientist, Cybersecurity
- BUSINESS: Entrepreneur, Startup Founder, Business Analyst, Marketing Manager, Sales Expert, Digital Marketer
- CREATIVE: UI/UX Designer, Video Editor, Animator, Content Creator, Graphic Designer
- MEDICAL: Doctor, Surgeon, Nurse, Pharmacist
- GOVERNMENT: IAS/Civil Services, Police Officer, Army Officer
- FREELANCE: Freelancer, Influencer, YouTuber, Content Creator
- FINANCE: Accountant, Investment Banker, Stock Trader

When a user asks about a career or profession, respond with this EXACT structured format:

**Career Overview**
[What this career is and why it matters]

**Goal**
[What success looks like in this career]

**Required Skills**
- Core: [list]
- Tools: [list]
- Soft Skills: [list]

**Roadmap**
🟢 Beginner: [steps]
🟡 Intermediate: [steps]
🔴 Advanced: [steps]

**Daily Tasks**
- [task 1 with time]
- [task 2 with time]

**Weekly Tasks**
- [task 1]
- [task 2]

**Challenges**
[Key challenges in this career]

**Salary Range**
[Indian salary range]

**Growth Opportunities**
[Career growth paths]

**Success Strategy**
[Key advice for succeeding]

For non-career questions, respond helpfully about learning, productivity, study plans, and motivation. Always be structured, clear, and actionable. Keep responses concise. Current context: ${context || 'general learning'}`;

    const response = await axios.post(
      OPENAI_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 800,
        temperature: 0.7
      },
      { headers: openAIHeaders() }
    );

    res.json({
      response: response.data.choices[0].message.content,
      mode: user.learningMode,
      aiProvider: 'OpenAI GPT-3.5'
    });
  } catch (error) {
    console.error('Chat error:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Error communicating with AI',
      error: error.response?.data?.error?.message || error.message
    });
  }
});

// ─── REPORT GENERATION ───────────────────────────────────
router.post('/report', auth, async (req, res) => {
  try {
    const { occupation } = req.body;
    if (!occupation) return res.status(400).json({ message: 'Occupation is required' });

    const reportPrompt = `You are an Advanced AI Career Intelligence + R&D + Success Analysis Engine.
Your task is to generate a COMPLETE, EXTREMELY DETAILED, PROFESSIONAL 4-YEAR RESEARCH & DEVELOPMENT REPORT for the selected occupation.

User Selected Occupation: ${occupation}

⚠️ IMPORTANT:
- Generate LONG, DEEP, PRACTICAL content
- Avoid generic answers
- Include real-world insights
- Include SUCCESSFUL PEOPLE ANALYSIS
- Include TIMELINE + EARNING PROGRESSION
- Output must look like a PREMIUM REPORT

----------------------------------------
1. INTRODUCTION
- Definition of the occupation
- Industry importance
- Global demand
- Evolution of the field
----------------------------------------
2. INDUSTRY PROBLEMS & GAPS
- Current challenges
- Skill gaps
- Market opportunities
----------------------------------------
3. 4-YEAR R&D ROADMAP
YEAR 1 – FOUNDATION
YEAR 2 – DEVELOPMENT
YEAR 3 – ADVANCED
YEAR 4 – EXPERT / INNOVATION
(Each year must include skills, projects, tools, schedule, outcomes)
----------------------------------------
4. SKILL INTELLIGENCE
- Technical skills
- Soft skills
- Tools mastery
----------------------------------------
5. TOOLS & TECHNOLOGIES
- Current tools
- Future tools
- AI integration
----------------------------------------
6. PROJECTS (DETAILED)
- Beginner → Advanced → Industry level
----------------------------------------
7. EXECUTION SYSTEM
- Daily / Weekly / Monthly plan
----------------------------------------
8. CAREER PATHS
- Jobs
- Business
- Freelance
----------------------------------------
9. SALARY & EARNING STRUCTURE
- Entry level
- Mid level
- Expert level
- Business earning
----------------------------------------
🔥 10. SUCCESSFUL PEOPLE ANALYSIS (VERY IMPORTANT)
For the selected occupation:
- List 3 to 5 MOST SUCCESSFUL PEOPLE in this field
- For each person include:
✔ Name  ✔ Background  ✔ Starting phase (struggles, education)
✔ Timeline of growth (year-wise or stage-wise)
✔ Major achievements  ✔ Turning point in career
✔ Estimated earnings progression
  - Early stage income
  - Mid career income
  - Peak/net worth
✔ What skills made them successful
✔ Key lessons from their journey
----------------------------------------
🔥 11. REALISTIC CAREER TIMELINE (IMPORTANT)
- Year-by-year realistic growth timeline:
Year 1 → Learning stage
Year 2 → Earning small
Year 3 → Stable income
Year 4 → High growth
- Mention:
✔ Expected salary at each stage
✔ Skills gained
✔ Level of expertise
----------------------------------------
12. FAILURE ANALYSIS
- Why people fail
- Mistakes to avoid
----------------------------------------
13. FUTURE SCOPE
- Industry trends
- AI impact
----------------------------------------
14. SUCCESS STRATEGY
- Step-by-step formula
- Growth mindset
----------------------------------------
15. FINAL MASTER SUMMARY
- Complete roadmap recap
- Clear execution plan
----------------------------------------
📌 FINAL RULES:
- Minimum 2500+ words
- Deep explanation
- No repetition
- Professional report style
- Real-world insights only
----------------------------------------
Now generate the COMPLETE REPORT for: ${occupation}`;

    const response = await axios.post(
      OPENAI_URL,
      {
        model: 'gpt-3.5-turbo-16k',
        messages: [
          { role: 'user', content: reportPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.8
      },
      { headers: openAIHeaders() }
    );

    res.json({
      report: response.data.choices[0].message.content,
      occupation,
      aiProvider: 'OpenAI GPT-3.5-16k'
    });
  } catch (error) {
    console.error('Report error:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Error generating report',
      error: error.response?.data?.error?.message || error.message
    });
  }
});

module.exports = router;
