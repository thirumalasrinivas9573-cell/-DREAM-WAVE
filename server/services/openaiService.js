const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class OpenAIService {
  static async generateGoalPlan(goal, age, education, skills) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a career guidance AI. Create a structured JSON response for career planning."
          },
          {
            role: "user",
            content: `Create a career plan for someone who wants to become a ${goal}. 
            Age: ${age}, Education: ${education}, Skills: ${skills.join(', ')}.
            
            Return a structured JSON with:
            {
              "careerPath": "string",
              "timeline": "string",
              "requiredSkills": ["string"],
              "learningResources": ["string"],
              "milestones": ["string"],
              "potentialSalary": "string",
              "growthOpportunities": ["string"]
            }`
          }
        ],
        temperature: 0.7,
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate goal plan');
    }
  }

  static async generateRDReport(goal) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a research analyst. Generate comprehensive R&D reports for careers."
          },
          {
            role: "user",
            content: `Generate a comprehensive R&D report for the career: ${goal}.
            
            Return structured JSON with:
            {
              "careerOverview": "string",
              "demand": "string",
              "skills": "string",
              "learningPath": "string",
              "tools": "string",
              "salary": "string",
              "growth": "string",
              "risks": "string",
              "opportunities": "string",
              "caseStudies": "string",
              "comparison": "string",
              "finalDecision": "string"
            }`
          }
        ],
        temperature: 0.7,
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate R&D report');
    }
  }

  static async generateRoadmap(goal, currentLevel) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a learning path designer. Create step-by-step roadmaps."
          },
          {
            role: "user",
            content: `Create a learning roadmap for ${goal}. Current level: ${currentLevel}.
            
            Return JSON with:
            {
              "roadmap": [
                {
                  "phase": "string",
                  "duration": "string",
                  "skills": ["string"],
                  "projects": ["string"],
                  "resources": ["string"]
                }
              ]
            }`
          }
        ],
        temperature: 0.7,
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate roadmap');
    }
  }

  static async generateDailyAdvice(category, query) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a helpful ${category} advisor. Provide practical, actionable advice.`
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.8,
      });

      return {
        response: completion.choices[0].message.content,
        category
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate advice');
    }
  }

  static async generateMentorAdvice(query) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are Lord Krishna, the divine mentor. Speak with wisdom, compassion, and guidance like in the Bhagavad Gita. Use metaphors from the scriptures and provide profound life advice."
          },
          {
            role: "user",
            content: `Arjuna asks: ${query}. Please guide him as Krishna would.`
          }
        ],
        temperature: 0.7,
      });

      return {
        response: completion.choices[0].message.content,
        sloka: this.getRandomSloka()
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate mentor advice');
    }
  }

  static getRandomSloka() {
    const slokas = [
      "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
      "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥",
      "अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते। तेषां नित्याभियुक्तानां मयक्षेतवश्चित्तम्॥",
      "श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्। स्वधर्मे निधनं श्रेयः परधर्मो भयावहः॥"
    ];
    return slokas[Math.floor(Math.random() * slokas.length)];
  }

  static async generateQuiz(topic) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Generate educational quizzes in JSON format."
          },
          {
            role: "user",
            content: `Create a quiz about ${topic}. Return JSON with:
            {
              "question": "string",
              "options": ["string"],
              "correctAnswer": 0,
              "explanation": "string"
            }`
          }
        ],
        temperature: 0.7,
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate quiz');
    }
  }
}

module.exports = OpenAIService;
