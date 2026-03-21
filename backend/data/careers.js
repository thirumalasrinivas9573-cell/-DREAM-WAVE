const extraCareers = require('./careers_extra');

const careers = {
  "software-engineer": {
    id: "software-engineer",
    title: "Software Engineer",
    category: "TECH",
    icon: "💻",
    description: "Build software systems, applications, and platforms that power the digital world.",
    whyImportant: "Software engineers are the backbone of the digital economy, creating tools used by billions of people daily.",
    avgSalary: "₹6L - ₹50L per year",
    jobDemand: "Very High",
    skills: {
      core: ["Data Structures", "Algorithms", "System Design", "OOP", "Databases"],
      tools: ["VS Code", "Git", "Docker", "AWS", "Linux"],
      soft: ["Problem Solving", "Communication", "Teamwork", "Critical Thinking"]
    },
    roadmap: {
      beginner: [
        "Learn programming basics (Python/JavaScript)",
        "Understand data types, loops, functions",
        "Learn Git and version control",
        "Build simple CLI programs",
        "Understand HTML/CSS basics"
      ],
      intermediate: [
        "Learn Data Structures & Algorithms",
        "Build full-stack web projects",
        "Learn databases (SQL + MongoDB)",
        "Understand REST APIs",
        "Contribute to open source"
      ],
      advanced: [
        "System Design & Architecture",
        "Cloud platforms (AWS/GCP/Azure)",
        "Microservices & Docker",
        "Performance optimization",
        "Lead technical projects"
      ]
    },
    tasks: {
      daily: [
        { title: "Code for 1 hour", description: "Practice coding problems on LeetCode or HackerRank", time: "60 min", difficulty: "easy" },
        { title: "Read tech article", description: "Read one article about software engineering", time: "15 min", difficulty: "easy" },
        { title: "Review yesterday's code", description: "Revisit and improve code written yesterday", time: "30 min", difficulty: "easy" }
      ],
      weekly: [
        { title: "Build a mini project", description: "Create a small project using what you learned", time: "5 hours", difficulty: "medium" },
        { title: "Solve 10 DSA problems", description: "Solve algorithm problems on LeetCode", time: "3 hours", difficulty: "hard" }
      ]
    }
  },
  "ai-engineer": {
    id: "ai-engineer",
    title: "AI Engineer",
    category: "TECH",
    icon: "🤖",
    description: "Design and build artificial intelligence systems, machine learning models, and intelligent applications.",
    whyImportant: "AI is transforming every industry. AI engineers are among the highest paid and most in-demand professionals globally.",
    avgSalary: "₹10L - ₹80L per year",
    jobDemand: "Extremely High",
    skills: {
      core: ["Machine Learning", "Deep Learning", "Python", "Mathematics", "Data Analysis"],
      tools: ["TensorFlow", "PyTorch", "Scikit-learn", "Jupyter", "Hugging Face"],
      soft: ["Analytical Thinking", "Research Skills", "Curiosity", "Problem Solving"]
    },
    roadmap: {
      beginner: [
        "Learn Python programming",
        "Study Linear Algebra & Statistics",
        "Understand basic ML concepts",
        "Learn NumPy and Pandas",
        "Build first ML model"
      ],
      intermediate: [
        "Deep Learning with TensorFlow/PyTorch",
        "Natural Language Processing",
        "Computer Vision basics",
        "Build end-to-end ML projects",
        "Learn MLOps basics"
      ],
      advanced: [
        "Large Language Models (LLMs)",
        "Model deployment & scaling",
        "Research paper implementation",
        "Build AI products",
        "Contribute to AI research"
      ]
    },
    tasks: {
      daily: [
        { title: "Study ML concept", description: "Learn one new ML algorithm or concept", time: "45 min", difficulty: "medium" },
        { title: "Practice Python", description: "Write Python code for data manipulation", time: "30 min", difficulty: "easy" },
        { title: "Read AI paper", description: "Read summary of an AI research paper", time: "20 min", difficulty: "medium" }
      ],
      weekly: [
        { title: "Build ML model", description: "Train and evaluate a machine learning model", time: "6 hours", difficulty: "hard" },
        { title: "Kaggle competition", description: "Participate in a Kaggle challenge", time: "4 hours", difficulty: "hard" }
      ]
    }
  },
  "web-developer": {
    id: "web-developer",
    title: "Web Developer",
    category: "TECH",
    icon: "🌐",
    description: "Create websites and web applications that are fast, beautiful, and user-friendly.",
    whyImportant: "Every business needs a web presence. Web developers are always in demand across all industries.",
    avgSalary: "₹4L - ₹30L per year",
    jobDemand: "High",
    skills: {
      core: ["HTML", "CSS", "JavaScript", "React/Vue", "Node.js"],
      tools: ["VS Code", "Git", "Figma", "Chrome DevTools", "Webpack"],
      soft: ["Creativity", "Attention to Detail", "Communication", "Time Management"]
    },
    roadmap: {
      beginner: [
        "Learn HTML structure",
        "Master CSS styling",
        "JavaScript fundamentals",
        "Build static websites",
        "Learn responsive design"
      ],
      intermediate: [
        "React.js or Vue.js",
        "Node.js & Express backend",
        "Database integration",
        "REST API development",
        "Deploy websites"
      ],
      advanced: [
        "Performance optimization",
        "Advanced React patterns",
        "Full-stack architecture",
        "Testing & CI/CD",
        "Build SaaS products"
      ]
    },
    tasks: {
      daily: [
        { title: "Build UI component", description: "Create one reusable UI component", time: "45 min", difficulty: "easy" },
        { title: "CSS challenge", description: "Recreate a design from CSS Battle", time: "30 min", difficulty: "medium" },
        { title: "JavaScript practice", description: "Solve one JavaScript problem", time: "30 min", difficulty: "easy" }
      ],
      weekly: [
        { title: "Build a webpage", description: "Create a complete responsive webpage", time: "4 hours", difficulty: "medium" },
        { title: "Clone a website", description: "Clone a popular website's UI", time: "5 hours", difficulty: "hard" }
      ]
    }
  },
  "data-scientist": {
    id: "data-scientist",
    title: "Data Scientist",
    category: "TECH",
    icon: "📊",
    description: "Extract insights from data to help businesses make better decisions.",
    whyImportant: "Data is the new oil. Data scientists help companies understand their customers and optimize operations.",
    avgSalary: "₹8L - ₹60L per year",
    jobDemand: "Very High",
    skills: {
      core: ["Statistics", "Python/R", "Machine Learning", "Data Visualization", "SQL"],
      tools: ["Pandas", "Matplotlib", "Tableau", "Power BI", "Spark"],
      soft: ["Storytelling", "Business Acumen", "Curiosity", "Communication"]
    },
    roadmap: {
      beginner: ["Learn Python & SQL", "Statistics fundamentals", "Data cleaning", "Basic visualization", "Excel for data"],
      intermediate: ["Machine learning models", "Advanced visualization", "Feature engineering", "A/B testing", "Big data basics"],
      advanced: ["Deep learning for data", "Real-time analytics", "Data pipeline design", "Business strategy", "Lead data teams"]
    },
    tasks: {
      daily: [
        { title: "Analyze a dataset", description: "Explore and analyze a public dataset", time: "60 min", difficulty: "medium" },
        { title: "SQL practice", description: "Solve SQL queries on HackerRank", time: "30 min", difficulty: "easy" },
        { title: "Statistics study", description: "Learn one statistical concept", time: "30 min", difficulty: "medium" }
      ],
      weekly: [
        { title: "Data project", description: "Complete an end-to-end data analysis project", time: "6 hours", difficulty: "hard" },
        { title: "Visualization dashboard", description: "Build an interactive data dashboard", time: "4 hours", difficulty: "medium" }
      ]
    }
  },
  "entrepreneur": {
    id: "entrepreneur",
    title: "Entrepreneur",
    category: "BUSINESS",
    icon: "🚀",
    description: "Build and scale your own business, creating value and solving real-world problems.",
    whyImportant: "Entrepreneurs drive innovation and economic growth, creating jobs and transforming industries.",
    avgSalary: "₹0 - Unlimited",
    jobDemand: "Self-Created",
    skills: {
      core: ["Business Strategy", "Marketing", "Finance", "Leadership", "Sales"],
      tools: ["Notion", "Slack", "Stripe", "Google Analytics", "CRM tools"],
      soft: ["Risk Taking", "Resilience", "Vision", "Networking", "Adaptability"]
    },
    roadmap: {
      beginner: ["Learn business basics", "Identify a problem to solve", "Validate your idea", "Build MVP", "Get first customers"],
      intermediate: ["Scale marketing", "Build a team", "Manage finances", "Product-market fit", "Raise funding"],
      advanced: ["Scale operations", "Enter new markets", "Build company culture", "IPO or acquisition", "Mentor others"]
    },
    tasks: {
      daily: [
        { title: "Read business news", description: "Stay updated with market trends", time: "20 min", difficulty: "easy" },
        { title: "Network with one person", description: "Connect with a potential partner or mentor", time: "30 min", difficulty: "medium" },
        { title: "Work on your idea", description: "Spend time building or improving your product", time: "2 hours", difficulty: "hard" }
      ],
      weekly: [
        { title: "Customer interview", description: "Talk to 3 potential customers about their problems", time: "3 hours", difficulty: "medium" },
        { title: "Business plan update", description: "Review and update your business plan", time: "2 hours", difficulty: "medium" }
      ]
    }
  },
  "ui-ux-designer": {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    category: "CREATIVE",
    icon: "🎨",
    description: "Design beautiful, intuitive interfaces that users love to interact with.",
    whyImportant: "Good design is the difference between a product people love and one they abandon. UX designers are critical to product success.",
    avgSalary: "₹5L - ₹35L per year",
    jobDemand: "High",
    skills: {
      core: ["User Research", "Wireframing", "Prototyping", "Visual Design", "Usability Testing"],
      tools: ["Figma", "Adobe XD", "Sketch", "InVision", "Zeplin"],
      soft: ["Empathy", "Creativity", "Communication", "Attention to Detail"]
    },
    roadmap: {
      beginner: ["Learn design principles", "Master Figma basics", "Study color theory", "Create wireframes", "Build first UI"],
      intermediate: ["User research methods", "Advanced prototyping", "Design systems", "Accessibility", "Portfolio building"],
      advanced: ["Lead design teams", "Product strategy", "Design thinking workshops", "Brand identity", "Mentor designers"]
    },
    tasks: {
      daily: [
        { title: "Design challenge", description: "Complete a daily UI design challenge", time: "45 min", difficulty: "medium" },
        { title: "Study great designs", description: "Analyze 3 great UI designs on Dribbble", time: "20 min", difficulty: "easy" },
        { title: "Figma practice", description: "Practice one Figma feature or technique", time: "30 min", difficulty: "easy" }
      ],
      weekly: [
        { title: "Design a full screen", description: "Design a complete app screen with all states", time: "4 hours", difficulty: "medium" },
        { title: "User research", description: "Conduct a usability test with 2 users", time: "3 hours", difficulty: "hard" }
      ]
    }
  },
  "doctor": {
    id: "doctor",
    title: "Doctor",
    category: "MEDICAL",
    icon: "🏥",
    description: "Diagnose and treat illnesses, helping patients live healthier and longer lives.",
    whyImportant: "Doctors are essential to society, saving lives and improving quality of life for millions of people.",
    avgSalary: "₹8L - ₹1Cr per year",
    jobDemand: "Always High",
    skills: {
      core: ["Anatomy", "Physiology", "Pharmacology", "Clinical Skills", "Diagnosis"],
      tools: ["Stethoscope", "Medical imaging", "EHR systems", "Lab equipment"],
      soft: ["Empathy", "Communication", "Decision Making", "Stress Management"]
    },
    roadmap: {
      beginner: ["Study Biology & Chemistry", "Prepare for NEET", "Clear MBBS entrance", "Complete MBBS (5.5 years)", "Internship"],
      intermediate: ["MD/MS specialization", "Residency program", "Clinical practice", "Research", "Build patient base"],
      advanced: ["Super-specialization", "Own clinic/hospital", "Medical research", "Teaching", "Healthcare leadership"]
    },
    tasks: {
      daily: [
        { title: "Study medical topic", description: "Study one medical concept or disease", time: "2 hours", difficulty: "hard" },
        { title: "Practice MCQs", description: "Solve 50 NEET/medical MCQs", time: "1 hour", difficulty: "medium" },
        { title: "Read medical journal", description: "Read one medical research article", time: "30 min", difficulty: "medium" }
      ],
      weekly: [
        { title: "Full subject revision", description: "Revise one complete subject", time: "8 hours", difficulty: "hard" },
        { title: "Mock test", description: "Take a full mock medical exam", time: "3 hours", difficulty: "hard" }
      ]
    }
  },
  "ias-officer": {
    id: "ias-officer",
    title: "IAS Officer",
    category: "GOVERNMENT",
    icon: "🏛️",
    description: "Serve the nation as an Indian Administrative Service officer, shaping public policy and governance.",
    whyImportant: "IAS officers are the backbone of Indian governance, implementing policies that affect millions of citizens.",
    avgSalary: "₹56,100 - ₹2,50,000 per month + perks",
    jobDemand: "Competitive",
    skills: {
      core: ["General Studies", "Current Affairs", "Essay Writing", "Analytical Thinking", "Leadership"],
      tools: ["Newspapers", "NCERT books", "PYQ papers", "Test series"],
      soft: ["Integrity", "Decision Making", "Communication", "Empathy", "Patience"]
    },
    roadmap: {
      beginner: ["Complete graduation", "Start NCERT reading", "Follow current affairs daily", "Understand UPSC syllabus", "Join test series"],
      intermediate: ["Complete optional subject", "Answer writing practice", "Mock interviews", "Previous year papers", "Revision strategy"],
      advanced: ["Clear Prelims", "Clear Mains", "Clear Interview", "Training at LBSNAA", "First posting"]
    },
    tasks: {
      daily: [
        { title: "Read newspaper", description: "Read The Hindu or Indian Express for 1 hour", time: "60 min", difficulty: "easy" },
        { title: "Study GS topic", description: "Study one General Studies topic in depth", time: "2 hours", difficulty: "hard" },
        { title: "Answer writing", description: "Write 2 UPSC-style answers", time: "1 hour", difficulty: "hard" }
      ],
      weekly: [
        { title: "Mock test", description: "Take a full UPSC prelims mock test", time: "2 hours", difficulty: "hard" },
        { title: "Essay writing", description: "Write one full UPSC essay", time: "3 hours", difficulty: "hard" }
      ]
    }
  },
  "youtuber": {
    id: "youtuber",
    title: "YouTuber",
    category: "FREELANCE",
    icon: "📺",
    description: "Create video content on YouTube, building an audience and earning through ads, sponsorships, and products.",
    whyImportant: "YouTube has created thousands of millionaires. It's a platform where passion meets income.",
    avgSalary: "₹0 - ₹10Cr+ per year",
    jobDemand: "Self-Created",
    skills: {
      core: ["Video Production", "Scripting", "Editing", "SEO", "Audience Building"],
      tools: ["Camera", "Adobe Premiere", "DaVinci Resolve", "TubeBuddy", "Canva"],
      soft: ["Consistency", "Creativity", "Storytelling", "Resilience", "Marketing"]
    },
    roadmap: {
      beginner: ["Choose your niche", "Buy basic equipment", "Create first 10 videos", "Learn basic editing", "Understand YouTube SEO"],
      intermediate: ["Consistent upload schedule", "Grow to 1000 subscribers", "Monetize channel", "Collaborate with others", "Build community"],
      advanced: ["Multiple revenue streams", "Brand deals", "Own products/courses", "Team building", "Expand to other platforms"]
    },
    tasks: {
      daily: [
        { title: "Create content idea", description: "Brainstorm 5 video ideas for your niche", time: "20 min", difficulty: "easy" },
        { title: "Study analytics", description: "Review your channel analytics and learn from data", time: "15 min", difficulty: "easy" },
        { title: "Engage with audience", description: "Reply to comments and engage with community", time: "20 min", difficulty: "easy" }
      ],
      weekly: [
        { title: "Film a video", description: "Script, film, and edit one complete video", time: "6 hours", difficulty: "medium" },
        { title: "Study top creators", description: "Analyze 3 successful channels in your niche", time: "2 hours", difficulty: "easy" }
      ]
    }
  },
  "cybersecurity": {
    id: "cybersecurity",
    title: "Cybersecurity Expert",
    category: "TECH",
    icon: "🔒",
    description: "Protect systems, networks, and data from digital attacks and cyber threats.",
    whyImportant: "With cyberattacks costing trillions globally, cybersecurity experts are among the most critical and well-paid professionals.",
    avgSalary: "₹8L - ₹60L per year",
    jobDemand: "Extremely High",
    skills: {
      core: ["Networking", "Linux", "Ethical Hacking", "Cryptography", "Security Protocols"],
      tools: ["Kali Linux", "Wireshark", "Metasploit", "Burp Suite", "Nmap"],
      soft: ["Analytical Thinking", "Attention to Detail", "Ethics", "Continuous Learning"]
    },
    roadmap: {
      beginner: ["Learn networking basics", "Linux fundamentals", "Python scripting", "CompTIA Security+", "Basic ethical hacking"],
      intermediate: ["CEH certification", "Penetration testing", "Web app security", "Incident response", "Bug bounty programs"],
      advanced: ["CISSP certification", "Red team operations", "Security architecture", "Lead security teams", "Security consulting"]
    },
    tasks: {
      daily: [
        { title: "CTF challenge", description: "Solve one Capture The Flag challenge", time: "1 hour", difficulty: "hard" },
        { title: "Security news", description: "Read about latest cyber threats and vulnerabilities", time: "20 min", difficulty: "easy" },
        { title: "Linux practice", description: "Practice Linux commands and scripting", time: "30 min", difficulty: "medium" }
      ],
      weekly: [
        { title: "Penetration test lab", description: "Practice pen testing on a vulnerable VM", time: "4 hours", difficulty: "hard" },
        { title: "Bug bounty hunt", description: "Hunt for bugs on HackerOne or Bugcrowd", time: "3 hours", difficulty: "hard" }
      ]
    }
  },
  "app-developer": {
    id: "app-developer", title: "App Developer", category: "TECH", icon: "📱",
    description: "Build mobile applications for iOS and Android that millions of people use daily.",
    whyImportant: "Mobile apps are the primary way people interact with technology. App developers are in massive demand.",
    avgSalary: "₹5L - ₹40L per year", jobDemand: "Very High",
    skills: { core: ["React Native / Flutter", "Swift / Kotlin", "APIs", "UI Design", "App Store Deployment"], tools: ["Android Studio", "Xcode", "VS Code", "Firebase", "Figma"], soft: ["Creativity", "Problem Solving", "Attention to Detail", "User Empathy"] },
    roadmap: {
      beginner: ["Learn programming basics", "Choose React Native or Flutter", "Build first simple app", "Understand mobile UI patterns", "Learn device APIs"],
      intermediate: ["State management", "Backend integration", "Push notifications", "App Store submission", "Performance optimization"],
      advanced: ["Native modules", "Complex animations", "Offline-first apps", "Monetization strategies", "Build app startup"]
    },
    tasks: {
      daily: [
        { title: "Build a UI screen", description: "Design and code one mobile screen", time: "1 hour", difficulty: "medium" },
        { title: "Study mobile patterns", description: "Learn one mobile design pattern", time: "30 min", difficulty: "easy" }
      ],
      weekly: [
        { title: "Build a mini app", description: "Create a small functional mobile app", time: "6 hours", difficulty: "hard" }
      ]
    }
  },
  "business-analyst": {
    id: "business-analyst", title: "Business Analyst", category: "BUSINESS", icon: "📈",
    description: "Bridge the gap between business needs and technology solutions by analyzing data and processes.",
    whyImportant: "Every company needs analysts to make data-driven decisions and improve efficiency.",
    avgSalary: "₹5L - ₹25L per year", jobDemand: "High",
    skills: { core: ["Data Analysis", "Requirements Gathering", "Process Modeling", "SQL", "Reporting"], tools: ["Excel", "Power BI", "Tableau", "JIRA", "Confluence"], soft: ["Communication", "Critical Thinking", "Stakeholder Management", "Problem Solving"] },
    roadmap: {
      beginner: ["Learn Excel & SQL", "Understand business processes", "Data visualization basics", "Requirements documentation", "SWOT analysis"],
      intermediate: ["Power BI / Tableau", "Agile methodology", "Process improvement", "Stakeholder interviews", "Business case writing"],
      advanced: ["Enterprise architecture", "Change management", "Lead BA teams", "Strategic planning", "Consulting"]
    },
    tasks: {
      daily: [
        { title: "Analyze a dataset", description: "Find insights from a business dataset", time: "45 min", difficulty: "medium" },
        { title: "Write requirements", description: "Document one business requirement clearly", time: "30 min", difficulty: "easy" }
      ],
      weekly: [
        { title: "Build a dashboard", description: "Create a business intelligence dashboard", time: "4 hours", difficulty: "medium" }
      ]
    }
  },
  "marketing-manager": {
    id: "marketing-manager", title: "Marketing Manager", category: "BUSINESS", icon: "📣",
    description: "Plan and execute marketing strategies to grow brands, attract customers, and drive revenue.",
    whyImportant: "Every business needs marketing to survive. Great marketers can 10x a company's growth.",
    avgSalary: "₹5L - ₹30L per year", jobDemand: "High",
    skills: { core: ["Digital Marketing", "SEO/SEM", "Content Strategy", "Analytics", "Brand Management"], tools: ["Google Ads", "Meta Ads", "HubSpot", "Canva", "Google Analytics"], soft: ["Creativity", "Communication", "Data-Driven Thinking", "Leadership"] },
    roadmap: {
      beginner: ["Learn digital marketing basics", "Google Analytics", "Social media marketing", "Email marketing", "SEO fundamentals"],
      intermediate: ["Paid advertising", "Content marketing", "Marketing automation", "A/B testing", "Campaign management"],
      advanced: ["Brand strategy", "Marketing leadership", "Budget management", "Multi-channel campaigns", "CMO track"]
    },
    tasks: {
      daily: [
        { title: "Analyze campaign metrics", description: "Review and optimize running campaigns", time: "30 min", difficulty: "easy" },
        { title: "Create content", description: "Write one piece of marketing content", time: "45 min", difficulty: "medium" }
      ],
      weekly: [
        { title: "Launch a campaign", description: "Plan and launch a small marketing campaign", time: "4 hours", difficulty: "hard" }
      ]
    }
  },
  "sales-expert": {
    id: "sales-expert", title: "Sales Expert", category: "BUSINESS", icon: "💼",
    description: "Drive revenue by identifying prospects, building relationships, and closing deals.",
    whyImportant: "Sales is the lifeblood of every business. Top salespeople earn more than most engineers.",
    avgSalary: "₹4L - ₹50L+ per year", jobDemand: "Always High",
    skills: { core: ["Prospecting", "Negotiation", "CRM", "Closing Techniques", "Product Knowledge"], tools: ["Salesforce", "HubSpot CRM", "LinkedIn Sales Navigator", "Zoom", "Pipedrive"], soft: ["Persuasion", "Resilience", "Empathy", "Communication", "Goal-Oriented"] },
    roadmap: {
      beginner: ["Learn sales fundamentals", "Cold calling basics", "CRM tools", "Product knowledge", "Handle objections"],
      intermediate: ["B2B sales", "Account management", "Sales pipeline", "Negotiation tactics", "Team selling"],
      advanced: ["Enterprise sales", "Sales leadership", "Revenue strategy", "Build sales teams", "VP of Sales"]
    },
    tasks: {
      daily: [
        { title: "Make 10 calls", description: "Prospect and call 10 potential customers", time: "1 hour", difficulty: "medium" },
        { title: "Follow up leads", description: "Follow up on all pending leads", time: "30 min", difficulty: "easy" }
      ],
      weekly: [
        { title: "Close a deal", description: "Work to close at least one deal this week", time: "varies", difficulty: "hard" }
      ]
    }
  },
  "startup-founder": {
    id: "startup-founder", title: "Startup Founder", category: "BUSINESS", icon: "🦄",
    description: "Build a high-growth startup from zero to scale, disrupting industries with innovative solutions.",
    whyImportant: "Startups create the future. Founders who succeed change the world and create massive wealth.",
    avgSalary: "₹0 - ₹100Cr+", jobDemand: "Self-Created",
    skills: { core: ["Product Development", "Fundraising", "Team Building", "Growth Hacking", "Pitching"], tools: ["Notion", "Figma", "Stripe", "AWS", "AngelList"], soft: ["Vision", "Resilience", "Leadership", "Risk Tolerance", "Networking"] },
    roadmap: {
      beginner: ["Identify market problem", "Validate idea with users", "Build MVP", "Get first 10 customers", "Learn lean startup"],
      intermediate: ["Raise seed funding", "Build core team", "Achieve product-market fit", "Scale marketing", "Manage burn rate"],
      advanced: ["Series A/B funding", "Scale to 100+ team", "International expansion", "Profitability", "IPO or acquisition"]
    },
    tasks: {
      daily: [
        { title: "Talk to a user", description: "Get feedback from one customer or prospect", time: "30 min", difficulty: "medium" },
        { title: "Build or ship", description: "Ship one improvement to your product", time: "2 hours", difficulty: "hard" }
      ],
      weekly: [
        { title: "Investor update", description: "Write a weekly update for investors/advisors", time: "1 hour", difficulty: "medium" }
      ]
    }
  },
  "video-editor": {
    id: "video-editor", title: "Video Editor", category: "CREATIVE", icon: "🎬",
    description: "Transform raw footage into compelling stories through editing, effects, and sound design.",
    whyImportant: "Video content dominates the internet. Skilled editors are needed by YouTubers, brands, and studios.",
    avgSalary: "₹3L - ₹25L per year", jobDemand: "High",
    skills: { core: ["Video Editing", "Color Grading", "Motion Graphics", "Audio Mixing", "Storytelling"], tools: ["Adobe Premiere Pro", "DaVinci Resolve", "After Effects", "Final Cut Pro", "Audition"], soft: ["Creativity", "Attention to Detail", "Time Management", "Communication"] },
    roadmap: {
      beginner: ["Learn Premiere Pro basics", "Understand cuts and transitions", "Basic color correction", "Audio sync", "Export settings"],
      intermediate: ["Advanced color grading", "Motion graphics", "Sound design", "Client projects", "Build portfolio"],
      advanced: ["Cinematic editing", "VFX basics", "Lead editor roles", "Own production house", "Film editing"]
    },
    tasks: {
      daily: [
        { title: "Edit a clip", description: "Edit a 1-minute video clip with cuts and music", time: "1 hour", difficulty: "medium" },
        { title: "Study great edits", description: "Analyze editing techniques in 3 videos", time: "20 min", difficulty: "easy" }
      ],
      weekly: [
        { title: "Complete a project", description: "Edit a full video from raw footage to final", time: "6 hours", difficulty: "hard" }
      ]
    }
  },
  "animator": {
    id: "animator", title: "Animator", category: "CREATIVE", icon: "🎭",
    description: "Create animated content for films, games, ads, and digital media.",
    whyImportant: "Animation is a multi-billion dollar industry powering entertainment, gaming, and advertising.",
    avgSalary: "₹4L - ₹30L per year", jobDemand: "Growing",
    skills: { core: ["2D/3D Animation", "Character Design", "Rigging", "Storyboarding", "Motion Principles"], tools: ["Blender", "Adobe Animate", "Maya", "After Effects", "Procreate"], soft: ["Creativity", "Patience", "Storytelling", "Attention to Detail"] },
    roadmap: {
      beginner: ["Learn animation principles", "Master one tool (Blender/Animate)", "Create simple animations", "Study character design", "Build first reel"],
      intermediate: ["Character rigging", "Lip sync", "3D modeling", "Client projects", "Portfolio development"],
      advanced: ["Studio-quality animation", "Lead animator", "Own animation studio", "Film/game industry", "Teach animation"]
    },
    tasks: {
      daily: [
        { title: "Animate a scene", description: "Create a short 5-second animation", time: "1 hour", difficulty: "medium" },
        { title: "Study animation", description: "Watch and analyze professional animations", time: "20 min", difficulty: "easy" }
      ],
      weekly: [
        { title: "Complete animation", description: "Finish a 30-second animated clip", time: "8 hours", difficulty: "hard" }
      ]
    }
  },
  "content-creator": {
    id: "content-creator", title: "Content Creator", category: "CREATIVE", icon: "✍️",
    description: "Create engaging content across platforms — blogs, social media, videos, and podcasts.",
    whyImportant: "Content is king. Brands pay top dollar for creators who can engage audiences and drive conversions.",
    avgSalary: "₹2L - ₹20L+ per year", jobDemand: "Very High",
    skills: { core: ["Writing", "SEO", "Social Media", "Video/Photo", "Analytics"], tools: ["Canva", "Buffer", "WordPress", "Adobe Suite", "Google Analytics"], soft: ["Creativity", "Consistency", "Storytelling", "Adaptability"] },
    roadmap: {
      beginner: ["Choose your niche", "Start a blog or channel", "Learn basic SEO", "Create consistently", "Build first 100 followers"],
      intermediate: ["Monetize content", "Brand collaborations", "Email list building", "Multi-platform presence", "Content calendar"],
      advanced: ["Own media brand", "Digital products", "Team of creators", "Speaking engagements", "Industry authority"]
    },
    tasks: {
      daily: [
        { title: "Create one post", description: "Write or design one piece of content", time: "45 min", difficulty: "easy" },
        { title: "Engage audience", description: "Reply to comments and DMs", time: "20 min", difficulty: "easy" }
      ],
      weekly: [
        { title: "Long-form content", description: "Create one blog post, video, or podcast episode", time: "4 hours", difficulty: "medium" }
      ]
    }
  },
  "nurse": {
    id: "nurse", title: "Nurse", category: "MEDICAL", icon: "💉",
    description: "Provide essential patient care, support doctors, and be the backbone of healthcare delivery.",
    whyImportant: "Nurses are the heart of healthcare. They outnumber doctors and are always in critical demand.",
    avgSalary: "₹3L - ₹15L per year", jobDemand: "Always High",
    skills: { core: ["Patient Care", "Clinical Skills", "Medication Administration", "Emergency Response", "Documentation"], tools: ["EHR systems", "Medical equipment", "IV lines", "Monitoring devices"], soft: ["Empathy", "Communication", "Stress Management", "Teamwork"] },
    roadmap: {
      beginner: ["Complete BSc Nursing", "Clinical rotations", "Basic life support", "Patient assessment", "Medication basics"],
      intermediate: ["Specialization (ICU/OT/ER)", "Advanced clinical skills", "Leadership in ward", "Research", "International nursing"],
      advanced: ["Nurse practitioner", "Nursing management", "Healthcare administration", "Teaching", "Policy making"]
    },
    tasks: {
      daily: [
        { title: "Study clinical topic", description: "Learn one clinical procedure or condition", time: "1 hour", difficulty: "medium" },
        { title: "Practice MCQs", description: "Solve 30 nursing exam questions", time: "30 min", difficulty: "medium" }
      ],
      weekly: [
        { title: "Case study", description: "Analyze a patient case study in detail", time: "2 hours", difficulty: "hard" }
      ]
    }
  },
  "pharmacist": {
    id: "pharmacist", title: "Pharmacist", category: "MEDICAL", icon: "💊",
    description: "Dispense medications, counsel patients, and ensure safe and effective drug therapy.",
    whyImportant: "Pharmacists are critical to patient safety, preventing drug errors and optimizing treatments.",
    avgSalary: "₹4L - ₹20L per year", jobDemand: "Stable High",
    skills: { core: ["Pharmacology", "Drug Interactions", "Patient Counseling", "Compounding", "Regulatory Knowledge"], tools: ["Pharmacy software", "Drug databases", "Lab equipment"], soft: ["Attention to Detail", "Communication", "Ethics", "Problem Solving"] },
    roadmap: {
      beginner: ["Complete B.Pharm", "Learn pharmacology", "Drug classification", "Dispensing basics", "Internship"],
      intermediate: ["M.Pharm specialization", "Hospital pharmacy", "Clinical pharmacy", "Drug information", "Research"],
      advanced: ["Pharmaceutical industry", "Drug development", "Regulatory affairs", "Own pharmacy chain", "Teaching"]
    },
    tasks: {
      daily: [
        { title: "Study drug class", description: "Learn one drug class and its interactions", time: "1 hour", difficulty: "medium" },
        { title: "Practice questions", description: "Solve pharmacy exam questions", time: "30 min", difficulty: "medium" }
      ],
      weekly: [
        { title: "Drug review", description: "Review a complete drug category in depth", time: "3 hours", difficulty: "hard" }
      ]
    }
  },
  "police": {
    id: "police", title: "Police Officer", category: "GOVERNMENT", icon: "👮",
    description: "Maintain law and order, protect citizens, and uphold justice in society.",
    whyImportant: "Police officers are essential to a safe and functioning society, protecting millions of citizens.",
    avgSalary: "₹25,000 - ₹1,00,000 per month", jobDemand: "Stable",
    skills: { core: ["Law Knowledge", "Physical Fitness", "Investigation", "Crisis Management", "Communication"], tools: ["Legal codes", "Forensic tools", "Surveillance equipment"], soft: ["Integrity", "Courage", "Decision Making", "Empathy", "Leadership"] },
    roadmap: {
      beginner: ["Physical fitness training", "Study Indian Penal Code", "Prepare for state PSC exam", "Clear written exam", "Physical test"],
      intermediate: ["Police training academy", "Field posting", "Investigation skills", "Community policing", "Promotions"],
      advanced: ["IPS through UPSC", "Senior officer roles", "Specialized units (CBI/CID)", "Leadership positions", "DGP track"]
    },
    tasks: {
      daily: [
        { title: "Physical training", description: "Running, strength training for fitness test", time: "1 hour", difficulty: "hard" },
        { title: "Study law", description: "Study IPC, CrPC, or current affairs", time: "1.5 hours", difficulty: "medium" }
      ],
      weekly: [
        { title: "Mock test", description: "Take a full police exam mock test", time: "2 hours", difficulty: "hard" }
      ]
    }
  },
  "army": {
    id: "army", title: "Army Officer", category: "GOVERNMENT", icon: "🎖️",
    description: "Serve the nation in the Indian Army, defending borders and maintaining national security.",
    whyImportant: "Army officers are the guardians of the nation, serving with honor, courage, and sacrifice.",
    avgSalary: "₹56,100 - ₹2,50,000 per month + perks", jobDemand: "Stable",
    skills: { core: ["Leadership", "Physical Fitness", "Tactical Planning", "Weapons Training", "Navigation"], tools: ["Military equipment", "Communication systems", "Maps"], soft: ["Discipline", "Courage", "Teamwork", "Decision Making Under Pressure"] },
    roadmap: {
      beginner: ["Physical fitness training", "Study for NDA/CDS exam", "Clear written exam", "SSB interview preparation", "Medical fitness"],
      intermediate: ["IMA/OTA training", "Field posting", "Specialization (Infantry/Artillery/etc)", "Leadership roles", "Promotions"],
      advanced: ["Senior officer ranks", "Staff College", "Command positions", "General officer track", "Defence policy"]
    },
    tasks: {
      daily: [
        { title: "Physical training", description: "5km run + strength exercises", time: "1.5 hours", difficulty: "hard" },
        { title: "Study for exam", description: "Study NDA/CDS syllabus topics", time: "2 hours", difficulty: "hard" }
      ],
      weekly: [
        { title: "Mock SSB", description: "Practice SSB interview tasks and GTO exercises", time: "3 hours", difficulty: "hard" }
      ]
    }
  },
  "freelancer": {
    id: "freelancer", title: "Freelancer", category: "FREELANCE", icon: "🧑‍💻",
    description: "Work independently on projects for multiple clients, offering skills like coding, design, writing, or marketing.",
    whyImportant: "Freelancing offers freedom, flexibility, and unlimited income potential. The gig economy is booming.",
    avgSalary: "₹2L - ₹50L+ per year", jobDemand: "Always Growing",
    skills: { core: ["Your Core Skill", "Client Communication", "Project Management", "Invoicing", "Portfolio Building"], tools: ["Upwork", "Fiverr", "Toptal", "LinkedIn", "Notion"], soft: ["Self-Discipline", "Communication", "Time Management", "Negotiation"] },
    roadmap: {
      beginner: ["Master one skill", "Build portfolio", "Create profiles on Upwork/Fiverr", "Get first client", "Deliver excellent work"],
      intermediate: ["Raise rates", "Build client base", "Specialize in niche", "Passive income streams", "Referral network"],
      advanced: ["Premium clients", "Agency model", "Productized services", "Passive income", "7-figure freelancing"]
    },
    tasks: {
      daily: [
        { title: "Apply to projects", description: "Send 5 quality proposals on freelance platforms", time: "1 hour", difficulty: "medium" },
        { title: "Skill improvement", description: "Spend time improving your core skill", time: "1 hour", difficulty: "medium" }
      ],
      weekly: [
        { title: "Portfolio update", description: "Add one new project to your portfolio", time: "2 hours", difficulty: "easy" }
      ]
    }
  },
  "surgeon": {
    id: "surgeon", title: "Surgeon", category: "MEDICAL", icon: "🔬",
    description: "Perform surgical procedures to treat injuries, diseases, and deformities, saving lives in the operating room.",
    whyImportant: "Surgeons are among the most respected and highest-paid professionals, directly saving lives through precision and skill.",
    avgSalary: "₹15L - ₹2Cr+ per year", jobDemand: "Always High",
    skills: { core: ["Anatomy", "Surgical Techniques", "Clinical Diagnosis", "Anesthesia Knowledge", "Post-op Care"], tools: ["Surgical instruments", "Laparoscopic equipment", "Robotic surgery systems", "Imaging tools"], soft: ["Precision", "Stress Management", "Decision Making", "Empathy", "Teamwork"] },
    roadmap: {
      beginner: ["Complete MBBS (5.5 years)", "Clear NEET PG", "MS General Surgery (3 years)", "Surgical internship", "Basic surgical skills"],
      intermediate: ["Super-specialization (MCh)", "Residency in specialty", "Assist senior surgeons", "Independent procedures", "Research publications"],
      advanced: ["Senior consultant surgeon", "Head of surgical department", "Robotic/laparoscopic mastery", "Own surgical center", "Medical teaching"]
    },
    tasks: {
      daily: [
        { title: "Study surgical anatomy", description: "Review anatomy relevant to surgical procedures", time: "2 hours", difficulty: "hard" },
        { title: "Practice MCQs", description: "Solve 50 surgery-related MCQs", time: "1 hour", difficulty: "medium" },
        { title: "Read surgical journal", description: "Read one surgical case study or research paper", time: "30 min", difficulty: "medium" }
      ],
      weekly: [
        { title: "Surgical simulation", description: "Practice surgical techniques on simulation models", time: "4 hours", difficulty: "hard" },
        { title: "Full subject revision", description: "Revise one complete surgical topic", time: "6 hours", difficulty: "hard" }
      ]
    }
  },
  "accountant": {
    id: "accountant", title: "Accountant", category: "FINANCE",
    icon: "🧾",
    description: "Manage financial records, prepare tax returns, audit accounts, and ensure regulatory compliance for businesses and individuals.",
    whyImportant: "Every business needs accountants. They are the financial backbone ensuring compliance, profitability, and growth.",
    avgSalary: "₹4L - ₹30L per year", jobDemand: "Always High",
    skills: { core: ["Financial Accounting", "Taxation", "Auditing", "Tally/SAP", "Financial Reporting"], tools: ["Tally ERP", "SAP", "QuickBooks", "MS Excel", "Zoho Books"], soft: ["Attention to Detail", "Integrity", "Analytical Thinking", "Time Management"] },
    roadmap: {
      beginner: ["Complete B.Com/BBA", "Learn Tally & Excel", "Understand GST & Income Tax", "Basic bookkeeping", "Internship at CA firm"],
      intermediate: ["CA Inter / CMA", "Audit experience", "Corporate accounting", "Financial statements", "Tax filing expertise"],
      advanced: ["CA Final / CPA", "CFO track", "Big 4 firms", "Own CA practice", "Financial consulting"]
    },
    tasks: {
      daily: [
        { title: "Study accounting standard", description: "Learn one accounting standard or tax rule", time: "1 hour", difficulty: "medium" },
        { title: "Practice problems", description: "Solve accounting problems or past exam questions", time: "1 hour", difficulty: "medium" },
        { title: "Read financial news", description: "Stay updated on tax laws and financial regulations", time: "20 min", difficulty: "easy" }
      ],
      weekly: [
        { title: "Mock exam", description: "Take a full CA/CMA mock test", time: "3 hours", difficulty: "hard" },
        { title: "Case study", description: "Analyze a real company's financial statements", time: "2 hours", difficulty: "medium" }
      ]
    }
  },
  "investment-banker": {
    id: "investment-banker", title: "Investment Banker", category: "FINANCE", icon: "🏦",
    description: "Help companies raise capital, execute mergers & acquisitions, and provide high-stakes financial advisory services.",
    whyImportant: "Investment bankers work on billion-dollar deals and are among the highest-paid professionals in the world.",
    avgSalary: "₹15L - ₹2Cr+ per year", jobDemand: "Competitive but High",
    skills: { core: ["Financial Modeling", "Valuation", "M&A", "Capital Markets", "Deal Structuring"], tools: ["Excel", "Bloomberg Terminal", "PowerPoint", "FactSet", "Capital IQ"], soft: ["Analytical Thinking", "Persuasion", "Networking", "Resilience", "Attention to Detail"] },
    roadmap: {
      beginner: ["Complete MBA Finance / CA / CFA", "Learn financial modeling in Excel", "Understand valuation methods (DCF, comps)", "Internship at bank/NBFC", "Network aggressively"],
      intermediate: ["Analyst role at IB firm", "Work on live deals", "Build pitch books", "CFA Level 1-3", "Develop sector expertise"],
      advanced: ["Associate to VP track", "Lead M&A transactions", "Client relationship management", "Managing Director", "Start own advisory firm"]
    },
    tasks: {
      daily: [
        { title: "Financial modeling practice", description: "Build or improve a DCF or LBO model", time: "1.5 hours", difficulty: "hard" },
        { title: "Read financial news", description: "Follow M&A deals and market news on Bloomberg/ET", time: "30 min", difficulty: "easy" },
        { title: "Study valuation", description: "Learn one valuation concept or method", time: "45 min", difficulty: "medium" }
      ],
      weekly: [
        { title: "Build a pitch book", description: "Create a mock investment banking pitch deck", time: "5 hours", difficulty: "hard" },
        { title: "Case study", description: "Analyze a recent M&A deal in detail", time: "3 hours", difficulty: "hard" }
      ]
    }
  },
  "civil-services": {
    id: "civil-services", title: "Civil Services Officer", category: "GOVERNMENT", icon: "🏛️",
    description: "Serve the nation through IAS, IPS, IFS, IRS and other central services, shaping policy and governance at the highest levels.",
    whyImportant: "Civil servants are the architects of India's development, implementing policies that impact over a billion people.",
    avgSalary: "₹56,100 - ₹2,50,000 per month + perks & allowances", jobDemand: "Competitive",
    skills: { core: ["General Studies", "Current Affairs", "Essay Writing", "Optional Subject Mastery", "Analytical Thinking"], tools: ["NCERT books", "Newspapers (The Hindu/IE)", "PYQ papers", "Test series platforms"], soft: ["Integrity", "Leadership", "Communication", "Empathy", "Decision Making"] },
    roadmap: {
      beginner: ["Complete graduation in any stream", "Understand UPSC CSE syllabus", "Start NCERT reading (6-12)", "Follow current affairs daily", "Choose optional subject"],
      intermediate: ["Complete GS preparation", "Answer writing practice daily", "Join test series", "Solve previous year papers", "Mock interviews"],
      advanced: ["Clear UPSC Prelims", "Clear UPSC Mains", "Clear Personality Test (Interview)", "Training at LBSNAA/academy", "First field posting"]
    },
    tasks: {
      daily: [
        { title: "Read newspaper", description: "Read The Hindu or Indian Express cover to cover", time: "1 hour", difficulty: "easy" },
        { title: "Study GS topic", description: "Cover one topic from GS 1/2/3/4 in depth", time: "2 hours", difficulty: "hard" },
        { title: "Answer writing", description: "Write 3 UPSC mains-style answers", time: "1.5 hours", difficulty: "hard" }
      ],
      weekly: [
        { title: "Full mock test", description: "Take a complete UPSC Prelims or Mains mock", time: "3 hours", difficulty: "hard" },
        { title: "Essay writing", description: "Write one full-length UPSC essay (1000-1200 words)", time: "2 hours", difficulty: "hard" }
      ]
    }
  },
  "graphic-designer": {
    id: "graphic-designer", title: "Graphic Designer", category: "CREATIVE", icon: "🖌️",
    description: "Create visual content — logos, branding, posters, social media graphics, and marketing materials that communicate ideas powerfully.",
    whyImportant: "Every brand needs visual identity. Graphic designers are in demand across agencies, startups, and as freelancers.",
    avgSalary: "₹3L - ₹20L per year", jobDemand: "High",
    skills: { core: ["Typography", "Color Theory", "Layout Design", "Branding", "Print & Digital Design"], tools: ["Adobe Photoshop", "Illustrator", "InDesign", "Canva", "Figma"], soft: ["Creativity", "Attention to Detail", "Client Communication", "Time Management"] },
    roadmap: {
      beginner: ["Learn design principles (color, typography, layout)", "Master Adobe Illustrator & Photoshop", "Create logos and posters", "Study great brands", "Build first portfolio"],
      intermediate: ["Brand identity projects", "Social media design", "Client freelance work", "Motion graphics basics", "Expand portfolio"],
      advanced: ["Art Director role", "Brand strategy", "Lead design teams", "Own design agency", "Teach design"]
    },
    tasks: {
      daily: [
        { title: "Design challenge", description: "Complete one daily logo or poster design challenge", time: "1 hour", difficulty: "medium" },
        { title: "Study great designs", description: "Analyze 5 designs on Behance or Dribbble", time: "20 min", difficulty: "easy" },
        { title: "Tool practice", description: "Learn one new Illustrator or Photoshop technique", time: "30 min", difficulty: "easy" }
      ],
      weekly: [
        { title: "Brand identity project", description: "Design a complete brand identity (logo, colors, fonts)", time: "5 hours", difficulty: "hard" },
        { title: "Portfolio update", description: "Add one polished project to your portfolio", time: "2 hours", difficulty: "medium" }
      ]
    }
  },
  "digital-marketer": {
    id: "digital-marketer", title: "Digital Marketer", category: "BUSINESS", icon: "📲",
    description: "Drive online growth through SEO, paid ads, social media, email marketing, and content strategy.",
    whyImportant: "Every business needs digital marketing to survive online. Skilled digital marketers can 10x a brand's revenue.",
    avgSalary: "₹3L - ₹25L per year", jobDemand: "Very High",
    skills: { core: ["SEO", "Google Ads", "Meta Ads", "Email Marketing", "Content Marketing"], tools: ["Google Analytics", "SEMrush", "Meta Business Suite", "Mailchimp", "HubSpot"], soft: ["Analytical Thinking", "Creativity", "Data-Driven Mindset", "Communication"] },
    roadmap: {
      beginner: ["Learn SEO fundamentals", "Google Analytics & Search Console", "Social media marketing basics", "Email marketing", "Google Ads basics"],
      intermediate: ["Run paid ad campaigns", "Content marketing strategy", "Marketing automation", "Conversion rate optimization", "A/B testing"],
      advanced: ["Full-funnel marketing strategy", "Performance marketing at scale", "Marketing leadership", "Own digital agency", "CMO track"]
    },
    tasks: {
      daily: [
        { title: "Analyze campaign metrics", description: "Review ad performance and optimize campaigns", time: "30 min", difficulty: "easy" },
        { title: "Create content", description: "Write one SEO blog post or social media content", time: "45 min", difficulty: "medium" },
        { title: "Keyword research", description: "Find 10 new keyword opportunities for SEO", time: "30 min", difficulty: "easy" }
      ],
      weekly: [
        { title: "Launch ad campaign", description: "Set up and launch a Google or Meta ad campaign", time: "3 hours", difficulty: "medium" },
        { title: "SEO audit", description: "Audit a website's SEO and create improvement plan", time: "3 hours", difficulty: "hard" }
      ]
    }
  },
  "stock-trader": {
    id: "stock-trader", title: "Stock Trader", category: "FINANCE", icon: "📉",
    description: "Buy and sell stocks, derivatives, and financial instruments to generate profits from market movements.",
    whyImportant: "Stock trading offers unlimited income potential. Skilled traders build wealth and financial freedom through market mastery.",
    avgSalary: "₹0 - Unlimited (performance-based)", jobDemand: "Self-Created",
    skills: { core: ["Technical Analysis", "Fundamental Analysis", "Risk Management", "Options Trading", "Market Psychology"], tools: ["Zerodha Kite", "TradingView", "Bloomberg", "Screener.in", "Sensibull"], soft: ["Discipline", "Emotional Control", "Patience", "Analytical Thinking", "Risk Tolerance"] },
    roadmap: {
      beginner: ["Open Demat account", "Learn stock market basics", "Understand candlestick charts", "Paper trading (no real money)", "Study risk management"],
      intermediate: ["Technical analysis mastery", "Options & futures basics", "Develop a trading strategy", "Backtest strategies", "Trade with small capital"],
      advanced: ["Algorithmic trading", "Options strategies (Iron Condor, Straddle)", "Portfolio management", "Prop trading", "Fund management"]
    },
    tasks: {
      daily: [
        { title: "Market analysis", description: "Analyze pre-market data and plan trades for the day", time: "45 min", difficulty: "medium" },
        { title: "Trade journal", description: "Record all trades with entry, exit, and lessons learned", time: "20 min", difficulty: "easy" },
        { title: "Chart study", description: "Analyze 10 stock charts for patterns and setups", time: "30 min", difficulty: "medium" }
      ],
      weekly: [
        { title: "Strategy review", description: "Review weekly trades and refine your strategy", time: "2 hours", difficulty: "medium" },
        { title: "Backtest a strategy", description: "Backtest a new trading strategy on historical data", time: "3 hours", difficulty: "hard" }
      ]
    }
  },
  "influencer": {
    id: "influencer", title: "Influencer", category: "FREELANCE", icon: "⭐",
    description: "Build a personal brand on social media, influence audiences, and monetize through brand deals and products.",
    whyImportant: "Influencer marketing is a $20B+ industry. Top influencers earn crores through brand partnerships.",
    avgSalary: "₹0 - ₹10Cr+ per year", jobDemand: "Self-Created",
    skills: { core: ["Content Creation", "Personal Branding", "Audience Building", "Monetization", "Analytics"], tools: ["Instagram", "YouTube", "TikTok", "Canva", "Later"], soft: ["Authenticity", "Consistency", "Creativity", "Networking"] },
    roadmap: {
      beginner: ["Choose your niche", "Create consistent content", "Grow to 1K followers", "Engage with community", "Understand algorithms"],
      intermediate: ["10K followers", "First brand deal", "Multiple platforms", "Email list", "Merchandise"],
      advanced: ["100K+ followers", "Premium brand deals", "Own products/courses", "Media appearances", "Build team"]
    },
    tasks: {
      daily: [
        { title: "Post content", description: "Create and post one piece of content", time: "1 hour", difficulty: "easy" },
        { title: "Engage followers", description: "Reply to comments and DMs for 20 minutes", time: "20 min", difficulty: "easy" }
      ],
      weekly: [
        { title: "Collaboration", description: "Reach out to 3 creators for collaboration", time: "1 hour", difficulty: "medium" }
      ]
    }
  }
};

// Merge extra careers
Object.assign(careers, extraCareers);

module.exports = careers;
