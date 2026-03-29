const OpenAI = require('openai');

let _client;
const getClient = () => {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
};

const SECTION_TITLES = [
  'Career Definition & Overview',
  'Industry Scope & Global Demand',
  'Required Skills & Competencies',
  'Step-by-Step Learning Roadmap',
  'Tools, Technologies & Platforms',
  'Job Roles & Salary Analysis',
  'Career Growth Path & Progression',
  'Challenges & Risks to Prepare For',
  'Opportunities & Key Benefits',
  'Real-World Case Studies',
  'Comparison with Similar Careers',
  'Practical Exposure Plan (Projects & Internships)',
  'Final Decision-Making Guidance'
];

async function generateReportContent(goalData) {
  const prompt = `You are a professional career research analyst. Generate a detailed, structured career R&D report for the following user.

User Goal: ${goalData.goal}
User Background: ${goalData.background || 'Not specified'}
AI Analysis Summary: ${goalData.summary ? JSON.stringify(goalData.summary) : 'Not available'}

Generate the report with these 13 sections. For each section write 150-250 words of detailed, practical, professional content.

Format each section EXACTLY like this:
[SECTION: Section Title Here]
Content here...
[/SECTION]

Sections to include:
${SECTION_TITLES.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Make the content specific to "${goalData.goal}", practical, data-driven, and actionable. Include real numbers, timelines, and examples where possible.`;

  const completion = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4000,
    temperature: 0.7
  });

  return completion.choices[0].message.content.trim();
}

function parseReportSections(rawContent) {
  const sections = [];
  const regex = /\[SECTION:\s*(.+?)\]([\s\S]*?)\[\/SECTION\]/g;
  let match;

  while ((match = regex.exec(rawContent)) !== null) {
    sections.push({
      title:   match[1].trim(),
      content: match[2].trim()
    });
  }

  // Fallback: if parsing fails, split by numbered headings
  if (sections.length === 0) {
    const parts = rawContent.split(/\n(?=\d+\.\s+[A-Z])/);
    for (const part of parts) {
      const lines = part.trim().split('\n');
      if (lines.length > 1) {
        sections.push({
          title:   lines[0].replace(/^\d+\.\s*/, '').trim(),
          content: lines.slice(1).join('\n').trim()
        });
      }
    }
  }

  return sections;
}

async function generateReport(goalData) {
  const rawContent = await generateReportContent(goalData);
  const sections   = parseReportSections(rawContent);
  return { sections, rawContent };
}

module.exports = { generateReport };
