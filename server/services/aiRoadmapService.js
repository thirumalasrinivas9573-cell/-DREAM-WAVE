const { robustAiCall } = require("./openaiService");

// ── Fallback used when AI quota is exhausted or call fails ────────────────────
const FALLBACK_ROADMAP = {
  currentStage: "You're at the beginning of your journey -- and that's a great place to start. Most professionals who succeed in this field started exactly where you are now, with curiosity and commitment. The path ahead is challenging but deeply rewarding.",
  overview: "Your Career Intelligence Roadmap is being built. This roadmap will give you a complete picture of exactly what skills to learn, in what order, using which resources, and what career outcomes to expect at each stage of your journey.",
  nextSteps: [
    { step: 1, title: "Define Your Goal With Precision", description: "Write down exactly what success looks like for you in 12 months. Be brutally specific. Not 'get better at coding' but 'build and deploy 3 full-stack web applications, complete 2 certifications, and secure a junior developer role at a product company paying Rs 5-8 LPA.' Vague goals produce vague results. Specific goals create a clear target that your brain naturally works toward.", duration: "3 days" },
    { step: 2, title: "Honest Skills Audit", description: "List every skill you currently have, rate your proficiency (1-5), and identify the exact gap between where you are and where you need to be. This audit is not about being harsh on yourself -- it's about creating a precise map. Most beginners skip this step and waste months learning the wrong things.", duration: "1 week" },
    { step: 3, title: "Build Your Daily Learning Habit", description: "Commit to 1-2 hours of focused, distraction-free learning every day. The research is clear: daily practice at 1 hour beats weekend marathons. Pick a fixed time (morning works best for most people), protect it like a meeting with your future employer, and track every session.", duration: "Ongoing" },
    { step: 4, title: "Select Your Core Resources", description: "Choose 2-3 high-quality learning resources and commit to finishing them before starting new ones. The biggest learning mistake is resource-hopping. One great course completed is worth 20 courses started.", duration: "1 week" },
    { step: 5, title: "Build Your First Real Project", description: "Apply every concept as you learn it by building a real project. This is non-negotiable. Tutorials teach syntax -- projects teach thinking. Your first project doesn't need to be impressive. It needs to be real, functional, and on GitHub.", duration: "1 month" },
    { step: 6, title: "Join a Community and Start Sharing", description: "Find 2-3 communities in your field (Discord servers, LinkedIn groups, meetups). Share your learning journey publicly. Not only does this build accountability, it also builds your professional network before you need it.", duration: "Ongoing" }
  ],
  skills: [
    { name: "Core Domain Fundamentals", level: "Beginner", priority: "High", order: 1, resources: "Start with the foundational textbook or official documentation for your field. Build breadth first, depth second." },
    { name: "Problem Solving & Analytical Thinking", level: "Beginner", priority: "High", order: 2, resources: "Practice daily with real-world problems. Use platforms like LeetCode, HackerRank, or domain-specific practice sites." },
    { name: "Professional Communication", level: "Intermediate", priority: "Medium", order: 3, resources: "Write about what you learn -- a blog, notes, or LinkedIn posts. Teaching others is the fastest way to deepen your own understanding." }
  ],
  courses: [
    { name: "Complete Beginner Course for Your Field", platform: "Coursera / edX", cost: "Free (audit)", duration: "4-6 weeks", why: "Builds structured foundation with certificates" },
    { name: "Hands-On Project-Based Course", platform: "Udemy", cost: "₹499-₹999", duration: "8-12 weeks", why: "Practical skills through real project building" },
    { name: "Industry Fundamentals Certification", platform: "Google / AWS / Microsoft", cost: "₹2,000-₹5,000", duration: "3-4 months", why: "Recognized by employers, proves validated skills" }
  ],
  colleges: [
    { name: "IIT (Indian Institutes of Technology)", type: "Government", location: "Multiple cities, India", fees: "₹2-3 LPA", ranking: "Top 10 NIRF", programs: "B.Tech, M.Tech, MBA, PhD", entranceExam: "JEE Advanced / GATE" },
    { name: "NIT (National Institutes of Technology)", type: "Government", location: "Multiple cities, India", fees: "₹1-2 LPA", ranking: "Top 50 NIRF", programs: "B.Tech, M.Tech", entranceExam: "JEE Main / GATE" }
  ],
  exams: [
    { name: "GATE (Graduate Aptitude Test in Engineering)", type: "Entrance", eligibility: "B.Tech/B.E. graduates", frequency: "Annual", importance: "High", prepTime: "6-12 months", description: "Opens doors to PSU jobs, M.Tech at IITs/NITs, and research positions." }
  ],
  timeline: [
    { period: "Month 1-2", focus: "Foundation building", goal: "Complete one beginner course and understand core concepts" },
    { period: "Month 3-4", focus: "Skill development", goal: "Build first small project applying what you've learned" },
    { period: "Month 5-6", focus: "Portfolio building", goal: "Complete 2-3 projects and document your progress" },
    { period: "Month 7-9", focus: "Advanced learning", goal: "Tackle complex topics and contribute to real work" },
    { period: "Month 10-12", focus: "Career preparation", goal: "Apply for opportunities, internships, or next-level roles" }
  ],
  milestones: [
    { title: "First Skill Certified", timeframe: "3 months", description: "Complete your first recognized course or certification" },
    { title: "First Real Project", timeframe: "5 months", description: "Build and publish something real that others can see" },
    { title: "First Opportunity", timeframe: "12 months", description: "Land your first internship, job, or client in this field" }
  ],
  salaryProgression: [
    { stage: "Entry Level", experience: "0-2 years", salary: "₹3 - ₹6 LPA" },
    { stage: "Mid Level", experience: "2-5 years", salary: "₹6 - ₹15 LPA" },
    { stage: "Senior Level", experience: "5+ years", salary: "₹15 - ₹40 LPA" }
  ],
  tips: [
    "Start before you feel ready -- clarity comes from action, not planning.",
    "Track your progress weekly. What gets measured gets improved.",
    "Find one mentor or community in your field. You don't have to figure this out alone."
  ]
};

/**
 * Generates a highly detailed, specialist-level career roadmap using GPT-4o.
 * Acts as a domain expert for the specific profession/goal.
 *
 * @param {string} goalTitle  - The user's goal (e.g. "Become a Data Scientist")
 * @param {string} category   - Goal category (e.g. "Career", "Education")
 * @param {Object} [userContext] - Optional extra context: { age, education, skills, interests }
 * @returns {Promise<Object>} - Rich roadmap object
 */
exports.generateRoadmap = async (goalTitle, category, userContext = {}) => {

  const { age = '', education = '', skills = '', interests = '' } = userContext;

const systemPrompt = `You are a world-class career specialist, domain expert, learning architect, and research analyst with 25+ years of experience.
You have personally guided thousands of students and professionals to successful, high-paying careers.
You speak directly to the student using "you". Be specific, practical, deeply knowledgeable, and brutally honest.

CONTENT DEPTH MANDATE — NON-NEGOTIABLE:
Every single "description" field in this roadmap must contain 200-400 words of REAL, SPECIFIC, ACTIONABLE content.
NO SHORT DESCRIPTIONS. NO GENERIC ADVICE. NO FILLER TEXT.

For nextSteps descriptions, include ALL of:
- Exactly what to study/do during this step
- Why this step is critical (career impact)
- Which specific resources to use (course names, books, YouTube channels, websites)
- Common mistakes students make at this stage and how to avoid them
- What you will be able to DO after completing this step
- How employers test this skill in interviews
- Approximate time commitment per day and total weeks

For skills resources, include ALL of:
- Best online course (Coursera/Udemy/YouTube) with specific course name
- Best book for this skill with author name
- Practice platform (LeetCode/HackerRank/Kaggle/etc.)
- How long this skill takes to reach job-ready proficiency

RETURN ONLY a valid JSON object. No markdown, no code blocks, no extra text -- just raw JSON.`;

  const userPrompt = `Generate an extremely detailed, professional-grade career roadmap for this student.

GOAL: ${goalTitle}
CATEGORY: ${category}
${age        ? `AGE: ${age}`               : ''}
${education  ? `EDUCATION: ${education}`   : ''}
${skills     ? `CURRENT SKILLS: ${skills}` : ''}
${interests  ? `INTERESTS: ${interests}`   : ''}

You are acting as a specialist in "${goalTitle}". Give advice that only a true expert in this field would know.
- Name REAL, specific colleges (IITs, NITs, BITS, private universities -- with actual NIRF rankings and fees)
- Name REAL entrance exams with actual eligibility criteria and frequency
- Name REAL courses on real platforms (Coursera, edX, Udemy, NPTEL, YouTube channels) with approximate costs
- Skills must be ordered by learning priority -- what to learn first, second, third
- Timeline must be realistic and broken into specific monthly milestones
- Salary data must reflect current Indian market rates (2024-2025)
- Tips must be field-specific insider knowledge, not generic advice
- Each step description must be 2-3 sentences of real, actionable guidance

Return a JSON object with EXACTLY this structure (all fields required):
{
  "currentStage": "One honest, direct sentence about where a student starting this goal typically is",
  "overview": "3-4 sentences written like a specialist mentor. Explain what this career path truly involves, what makes it challenging, and what makes it rewarding. Use 'you'. Be specific to '${goalTitle}'.",
  "nextSteps": [
    {
      "step": 1,
      "title": "Specific action step title",
      "description": "2-3 sentences of real, actionable guidance. What exactly to do, where to do it, and why it matters for this specific goal.",
      "duration": "Realistic time estimate e.g. '2-3 months'"
    }
  ],
  "skills": [
    {
      "name": "Exact skill name",
      "level": "Beginner | Intermediate | Advanced",
      "priority": "High | Medium | Low",
      "resources": "Specific resource: course name, book title, or platform to learn this skill",
      "order": 1
    }
  ],
  "courses": [
    {
      "name": "Exact course name",
      "platform": "Platform name (Coursera/Udemy/NPTEL/YouTube/edX/etc)",
      "cost": "Free | ₹amount | $amount",
      "duration": "X weeks/months",
      "why": "One sentence on why this specific course matters for this goal"
    }
  ],
  "colleges": [
    {
      "name": "Exact college name",
      "type": "Government | Private | Deemed",
      "location": "City, State",
      "fees": "Annual fees (approximate)",
      "ranking": "NIRF rank or other ranking",
      "programs": "Relevant degree/program offered",
      "entranceExam": "Exam required for admission"
    }
  ],
  "exams": [
    {
      "name": "Exact exam name",
      "type": "Entrance | Certification | Competitive | Professional",
      "eligibility": "Who can appear and minimum qualifications",
      "frequency": "Annual | Biannual | Monthly | On-demand",
      "importance": "High | Medium | Low",
      "prepTime": "Recommended preparation time",
      "description": "One sentence on what this exam tests and why it matters"
    }
  ],
  "timeline": [
    {
      "period": "Month X-Y",
      "focus": "Main focus area for this period",
      "goal": "Specific, measurable milestone to achieve by end of this period",
      "activities": ["Activity 1", "Activity 2", "Activity 3"]
    }
  ],
  "milestones": [
    {
      "title": "Milestone title",
      "timeframe": "e.g. 6 months from start",
      "description": "What success looks like at this milestone -- be specific and measurable"
    }
  ],
  "salaryProgression": [
    {
      "stage": "Role/Level name",
      "experience": "X-Y years",
      "salary": "₹X - ₹Y LPA",
      "roles": "Typical job titles at this stage"
    }
  ],
  "tips": [
    "Insider tip 1 -- field-specific knowledge only an expert would share",
    "Insider tip 2 -- common mistake to avoid in this field",
    "Insider tip 3 -- hidden opportunity or shortcut in this career path",
    "Insider tip 4 -- how to stand out from other candidates in this field",
    "Insider tip 5 -- encouraging, specific advice to keep going"
  ],
  "careerPaths": [
    {
      "title": "Specific job role/career path",
      "description": "What this role involves",
      "avgSalary": "₹X LPA",
      "demand": "High | Medium | Low"
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "cost": "Approximate cost",
      "value": "High | Medium | Low",
      "description": "Why this certification matters in the industry"
    }
  ],
  "books": [
    {
      "title": "Real book title",
      "author": "Author name",
      "why": "One sentence on why this book is essential for this career path",
      "category": "Technical | Soft Skills | Business | Biography",
      "level": "Beginner | Intermediate | Advanced"
    }
  ],
  "projects": [
    {
      "title": "Project name",
      "description": "2-3 sentences on what to build, what technologies to use, and the expected outcome",
      "difficulty": "Beginner | Intermediate | Advanced",
      "duration": "e.g. 2-4 weeks",
      "skills": ["Skill used", "Skill used", "Skill used"],
      "outcome": "What you will learn/prove by completing this project"
    }
  ]
}

Requirements:
- nextSteps: 7-9 items, ordered from first action to final goal
- skills: 8-12 items, ordered by learning sequence (order field: 1, 2, 3...)
- courses: 6-10 items, mix of free and paid
- colleges: 8-12 real Indian colleges relevant to this goal
- exams: 5-8 real exams relevant to this career path
- timeline: 10-14 periods covering the full journey
- milestones: 6-8 key checkpoints
- salaryProgression: 4-5 career stages
- tips: exactly 5 insider tips
- careerPaths: 4-6 specific roles this goal can lead to
- certifications: 4-6 valuable certifications for this field
- books: 5-8 essential books for this career (real titles, real authors)
- projects: 4-6 portfolio-worthy projects ordered by difficulty`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user",   content: userPrompt }
  ];

  const result = await robustAiCall(messages, "gpt-4o", FALLBACK_ROADMAP);

  // Validate minimum required structure
  if (!result.nextSteps || !Array.isArray(result.nextSteps)) {
    console.warn("[aiRoadmapService] AI returned invalid structure, using fallback.");
    return FALLBACK_ROADMAP;
  }

  return result;
};

exports.FALLBACK_ROADMAP = FALLBACK_ROADMAP;
