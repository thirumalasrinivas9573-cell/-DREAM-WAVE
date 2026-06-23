const OpenAI = require('openai');

class AIService {
  constructor() {
    this._client = null;
  }

  get client() {
    if (!this._client) {
      this._client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return this._client;
  }

  // Safe JSON parser with regex fallback
  safeJSONParse(text) {
    try {
      return JSON.parse(text);
    } catch (error) {
      // Try to extract JSON using regex
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (regexError) {
          console.error('Regex JSON parse failed:', regexError);
        }
      }
      throw new Error('Failed to parse JSON from AI response');
    }
  }

  // Generate roadmap with retry and fallback
  async generateRoadmap(goalTitle, category, retryCount = 0) {
    const prompt = `STRICT RULE: Return ONLY JSON. No explanation.
Act as real-world mentor. Break goal into actionable steps. Avoid generic output.

Goal: "${goalTitle}"
Category: "${category}"

Generate a detailed roadmap with phases. Each phase must be specific to this goal.

RETURN ONLY VALID JSON:
{
  "phases": [
    {
      "title": "Specific phase name (not generic)",
      "duration": "X weeks/months",
      "description": "What this phase achieves",
      "skills": ["specific skill 1", "specific skill 2"],
      "tasks": [
        {
          "title": "Actionable task title",
          "description": "Detailed description",
          "completed": false,
          "estimatedTime": "X hours",
          "priority": "high/medium/low"
        }
      ],
      "order": 1
    }
  ],
  "totalDuration": "X months",
  "difficulty": "beginner/intermediate/advanced"
}`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content.trim();
      return this.safeJSONParse(content);
    } catch (error) {
      console.error(`Roadmap generation attempt ${retryCount + 1} failed:`, error);
      
      if (retryCount < 2) {
        return this.generateRoadmap(goalTitle, category, retryCount + 1);
      }
      
      // Return fallback roadmap
      return this.getFallbackRoadmap(goalTitle, category);
    }
  }

  // Generate tasks from roadmap with learning system
  async generateTasksFromRoadmap(roadmap, goalTitle, retryCount = 0) {
    const prompt = `STRICT RULE: Return ONLY JSON. No explanation.
Act as real-world mentor. Create daily execution plan following learning system:
DAY 1 → Learn, DAY 2 → Quiz/Recall, DAY 3 → Practice, DAY 4 → Revise

Goal: "${goalTitle}"
Roadmap phases: ${JSON.stringify(roadmap.phases)}

Rules:
- Max 4 tasks per day
- Total time < 2 hours per day
- Must be actionable and specific
- Build real skills progressively
- Follow learning pattern

RETURN ONLY VALID JSON:
{
  "days": [
    {
      "day": 1,
      "title": "Day 1: Learn Fundamentals",
      "focus": "Learning phase",
      "tasks": [
        {
          "type": "learn",
          "title": "Specific learning task",
          "description": "Detailed actionable description",
          "estimatedTime": "30 min",
          "completed": false,
          "priority": "high",
          "difficulty": "easy"
        }
      ]
    }
  ]
}`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content.trim();
      return this.safeJSONParse(content);
    } catch (error) {
      console.error(`Task generation attempt ${retryCount + 1} failed:`, error);
      
      if (retryCount < 2) {
        return this.generateTasksFromRoadmap(roadmap, goalTitle, retryCount + 1);
      }
      
      // Return fallback tasks
      return this.getFallbackTasks(goalTitle);
    }
  }

  // AI Mentor response with context
  async getMentorResponse(message, userContext = {}, retryCount = 0) {
    const prompt = `You are an AI mentor - teacher, coach, and psychologist combined.
User Context: ${JSON.stringify(userContext)}
User Message: "${message}"

Respond as a supportive mentor who:
- Understands user goals and progress
- Gives practical suggestions
- Motivates like a friend
- Guides like an expert
- Adjusts difficulty gradually
- Builds confidence
- Focuses on execution

Keep response conversational, encouraging, and actionable.`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.8
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error(`Mentor response attempt ${retryCount + 1} failed:`, error);
      
      if (retryCount < 2) {
        return this.getMentorResponse(message, userContext, retryCount + 1);
      }
      
      return "I understand you're working towards your goals. Keep taking small, consistent steps forward. Every action you take brings you closer to success. What specific area would you like to focus on today?";
    }
  }

  // Fallback roadmap
  getFallbackRoadmap(goalTitle, category) {
    return {
      phases: [
        {
          title: "Foundation Phase",
          duration: "2 weeks",
          description: `Build fundamental knowledge for ${goalTitle}`,
          skills: ["Basic understanding", "Core concepts", "Initial practice"],
          tasks: [
            {
              title: "Research and understand basics",
              description: `Learn the fundamental concepts of ${goalTitle}`,
              completed: false,
              estimatedTime: "2 hours",
              priority: "high"
            },
            {
              title: "Create learning plan",
              description: "Organize your learning approach and resources",
              completed: false,
              estimatedTime: "1 hour",
              priority: "medium"
            }
          ],
          order: 1
        },
        {
          title: "Development Phase",
          duration: "4 weeks",
          description: `Develop practical skills in ${goalTitle}`,
          skills: ["Hands-on practice", "Skill building", "Problem solving"],
          tasks: [
            {
              title: "Start practical exercises",
              description: `Begin hands-on practice with ${goalTitle}`,
              completed: false,
              estimatedTime: "3 hours",
              priority: "high"
            }
          ],
          order: 2
        }
      ],
      totalDuration: "6 weeks",
      difficulty: "beginner"
    };
  }

  // Fallback tasks
  getFallbackTasks(goalTitle) {
    return {
      days: [
        {
          day: 1,
          title: "Day 1: Begin Learning",
          focus: "Learning phase",
          tasks: [
            {
              type: "learn",
              title: `Start learning ${goalTitle}`,
              description: `Begin your journey with ${goalTitle} by understanding the basics`,
              estimatedTime: "30 min",
              completed: false,
              priority: "high",
              difficulty: "easy"
            },
            {
              type: "research",
              title: "Gather resources",
              description: "Find and organize learning materials and resources",
              estimatedTime: "20 min",
              completed: false,
              priority: "medium",
              difficulty: "easy"
            }
          ]
        }
      ]
    };
  }
}

module.exports = new AIService();