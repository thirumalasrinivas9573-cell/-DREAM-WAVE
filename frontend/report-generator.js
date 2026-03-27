// Dream Wave R&D Report Generator (Frontend-Only)

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function generateReportContent(author) {
  try {
    const prompt = `Generate a comprehensive 10-page R&D report on Dream Wave AI System. Include sections: Abstract, Introduction, Problem Statement, Objectives, Literature Review, Methodology, System Architecture, Implementation, Results & Analysis, Future Scope, Conclusion. Make it detailed, professional, and realistic. Format as structured text with headings.`;

    const response = await fetch(API_URL + "/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt })
    });

    if (!response.ok) throw new Error("AI API error");

    const data = await response.json();
    const reportText = data.reply || "Report generation failed.";

    // Parse and format the report
    const today = new Date().toLocaleDateString();
    const orgs = ['Dream Wave Research Lab', 'AI Innovation Center', 'NextGen Tech Institute'];
    const organization = randomFrom(orgs);
    const titles = ['Dream Wave AI System: Revolutionizing Personalized Learning'];
    const title = randomFrom(titles);

    return [
      `# Cover Page\n\n**${title}**\n\nAuthor: ${author}\nDate: ${today}\nOrganization: ${organization}\n\n---`,
      `# Report Content\n\n${reportText}`
    ];
  } catch (error) {
    console.error("Report generation error:", error);
    return [`# Error\n\nFailed to generate report. Please try again.`];
  }
}

  // Each section is a long, realistic, human-like string
  const abstract = `The Dream Wave AI System is a comprehensive platform designed to transform the educational landscape by integrating advanced artificial intelligence with personalized learning methodologies. This report presents a detailed account of the system's conception, development, and deployment over a four-year R&D cycle. The work addresses the challenges of scalable personalization, adaptive content delivery, and holistic student engagement. Through a blend of literature review, technical innovation, and rigorous analysis, Dream Wave demonstrates the potential to redefine how students interact with knowledge and achieve their ambitions.`;

  const introduction = `Education is undergoing a paradigm shift, driven by rapid advancements in artificial intelligence and data-driven methodologies. Dream Wave AI System emerges as a response to the growing need for platforms that not only deliver content but also adapt to individual learner profiles. This report introduces the vision, motivation, and foundational principles behind Dream Wave, setting the stage for a deep dive into its technical and pedagogical innovations.`;

  const problemStatement = `Despite the proliferation of online learning resources, most platforms fail to provide truly personalized experiences. Students often face information overload, lack of motivation, and insufficient guidance. The core problem addressed by Dream Wave is the creation of an AI-driven system that can dynamically adapt learning paths, provide mentorship, and foster sustained engagement for diverse learners.`;

  const objectives = `- Develop an AI-powered platform for personalized learning\n- Integrate adaptive roadmaps, goal tracking, and mentorship\n- Ensure scalability and accessibility for students worldwide\n- Foster holistic growth: academic, personal, and professional\n- Enable data-driven insights for continuous improvement`;

  const literatureReview = `A review of recent literature reveals a surge in AI applications in education. Key works include: Smith et al. (2022) on adaptive learning algorithms, Lee & Kumar (2023) on AI-driven mentorship, and Patel (2024) on scalable content delivery. Dream Wave builds upon these foundations, introducing novel approaches to real-time feedback, gamification, and emotional intelligence in learning systems.`;

  const methodology = `The R&D process followed a four-phase methodology:\n1. Requirement Analysis: Stakeholder interviews, user surveys, and competitive benchmarking.\n2. System Design: Modular architecture, API-first development, and UI/UX prototyping.\n3. Implementation: Agile sprints, continuous integration, and iterative feature rollout.\n4. Evaluation: User testing, A/B experiments, and data analytics for performance measurement.`;

  const systemArchitecture = `Dream Wave is architected as a modular, cloud-native platform.\n- Frontend: Built with modern JavaScript, HTML5, and CSS3, the UI is responsive and accessible.\n- Backend (conceptual): Designed for scalability, with RESTful APIs, in-memory and persistent storage options, and robust authentication.\n- AI Engine: Integrates NLP, recommendation systems, and progress analytics.\n- Flow: Users set goals, receive personalized roadmaps, interact with AI mentors, and track progress in real time.`;

  const implementation = `Technologies Used:\n- Frontend: JavaScript (ES6+), HTML5, CSS3, Netlify deployment\n- Backend (conceptual): Node.js, Express.js, MongoDB (optional), Render deployment\n- AI: OpenAI GPT, custom recommendation logic, gamification modules\n\nAI Integration: Dream Wave leverages AI for natural language chat, dynamic roadmap generation, and adaptive feedback. The system is designed to be extensible, allowing integration of new AI models and data sources as the field evolves.`;

  const results = `Results & Analysis:\n- User Engagement: 87% of beta users reported increased motivation and clarity in learning.\n- Learning Outcomes: Students using Dream Wave completed 35% more tasks on average.\n- System Performance: Achieved 99.9% uptime and sub-second response times in simulated loads.\n- Insights:\n  • Personalized roadmaps led to higher goal completion rates\n  • AI mentorship reduced dropout rates by 22%\n  • Gamification features increased daily active usage\n\nThe analysis demonstrates Dream Wave's effectiveness in fostering sustained learning and measurable achievement.`;

  const futureScope = `Future Scope:\n- Integration of AR/VR for immersive learning\n- Expansion to corporate training and lifelong learning\n- Enhanced emotional intelligence and well-being modules\n- Deeper analytics for educators and parents\n- Open API for third-party content and tools`;

  const conclusion = `Dream Wave AI System represents a significant leap forward in personalized education. By combining technical innovation with a learner-centric philosophy, the platform sets a new standard for adaptive, engaging, and effective learning experiences. The four-year R&D journey has yielded a robust, scalable, and impactful solution, with vast potential for future growth and societal benefit.`;

  // Slight variation: shuffle some sentences, add random lines
  function vary(text, alt) {
    if (!alt) return text;
    const lines = text.split('\n');
    if (lines.length > 2 && Math.random() > 0.5) {
      const idx = Math.floor(Math.random() * (lines.length - 1)) + 1;
      [lines[0], lines[idx]] = [lines[idx], lines[0]];
    }
    if (alt && Math.random() > 0.7) lines.push(alt);
    return lines.join('\n');
  }

  // Compose full report
  return [
    `# Cover Page\n\n**${title}**\n\nAuthor: ${author}\nDate: ${today}\nOrganization: ${organization}\n\n---`,
    `# Abstract\n\n${vary(abstract, "This work lays the foundation for future AI-driven education systems.")}`,
    `# Introduction\n\n${vary(introduction, "The need for adaptive learning has never been greater.")}`,
    `# Problem Statement\n\n${vary(problemStatement, "Personalization remains a key challenge in EdTech.")}`,
    `# Objectives\n\n${objectives}`,
    `# Literature Review\n\n${vary(literatureReview, "Recent advances in AI have accelerated EdTech innovation.")}`,
    `# Methodology\n\n${methodology}`,
    `# System Architecture\n\n${systemArchitecture}`,
    `# Implementation Details\n\n${implementation}`,
    `# Results & Analysis\n\n${results}`,
    `# Future Scope\n\n${futureScope}`,
    `# Conclusion\n\n${conclusion}`
  ];
}

function renderReport(reportArr) {
  // Render as HTML with headings, spacing, and download button
  const html = reportArr.map(section => {
    return `<section class="report-section">${section.replace(/\n/g, '<br>')}</section>`;
  }).join('<hr class="report-hr">');
  return html;
}

function downloadReport(reportArr, author) {
  const text = reportArr.join('\n\n---\n\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DreamWave_RnD_Report_${author.replace(/\s+/g,'_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

window.DreamWaveReport = { generateReportContent, renderReport, downloadReport };
