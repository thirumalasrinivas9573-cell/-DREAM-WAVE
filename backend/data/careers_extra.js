const extraCareers = {
  "artificial-intelligence": {
    id: "artificial-intelligence", title: "Artificial Intelligence", category: "TECH", icon: "🤖",
    description: "Design and build intelligent systems that learn, reason, and solve complex real-world problems through data and algorithms.",
    whyImportant: "AI is transforming every industry. Professionals in this field are among the highest paid and most in-demand globally.",
    avgSalary: "₹10L - ₹1Cr+ per year", jobDemand: "Extremely High",
    skills: { core: ["Machine Learning", "Deep Learning", "Python", "Mathematics", "Data Analysis"], tools: ["TensorFlow", "PyTorch", "Scikit-learn", "Jupyter", "Hugging Face"], soft: ["Analytical Thinking", "Curiosity", "Research Skills", "Problem Solving", "Resilience"] },
    roadmap: {
      beginner: ["Learn Python programming", "Study Linear Algebra & Statistics", "Understand basic ML concepts", "Learn NumPy and Pandas", "Build first ML model"],
      intermediate: ["Deep Learning with TensorFlow/PyTorch", "Natural Language Processing", "Computer Vision basics", "Build end-to-end ML projects", "Learn MLOps basics"],
      advanced: ["Large Language Models (LLMs)", "Model deployment & scaling", "Research paper implementation", "Build AI products", "Contribute to AI research"]
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
  "space-science": {
    id: "space-science", title: "Space Science", category: "TECH", icon: "🛸",
    description: "Explore the universe through astronomy, astrophysics, satellite technology, and space exploration missions.",
    whyImportant: "Space science drives technological innovation, satellite communications, climate monitoring, and humanity's future beyond Earth.",
    avgSalary: "₹6L - ₹50L per year", jobDemand: "Growing",
    skills: { core: ["Astrophysics", "Mathematics", "Physics", "Orbital Mechanics", "Remote Sensing"], tools: ["MATLAB", "Python", "AutoCAD", "ANSYS", "Stellarium"], soft: ["Curiosity", "Analytical Thinking", "Patience", "Teamwork", "Resilience"] },
    roadmap: {
      beginner: ["Study Physics & Mathematics deeply", "Learn astronomy basics", "Understand space missions history", "Learn Python for data analysis", "Join astronomy clubs"],
      intermediate: ["Study astrophysics & orbital mechanics", "Learn satellite technology", "Internship at ISRO programs", "Research projects", "Learn remote sensing"],
      advanced: ["Specialize in planetary science/astrophysics", "PhD research", "Work at ISRO/NASA/ESA", "Publish research papers", "Lead space missions"]
    },
    tasks: {
      daily: [
        { title: "Study physics concept", description: "Learn one astrophysics or space science concept", time: "1 hour", difficulty: "hard" },
        { title: "Follow space news", description: "Read about latest space missions and discoveries", time: "20 min", difficulty: "easy" },
        { title: "Math practice", description: "Solve advanced mathematics problems", time: "45 min", difficulty: "hard" }
      ],
      weekly: [
        { title: "Research paper", description: "Read and summarize one space science research paper", time: "3 hours", difficulty: "hard" },
        { title: "Simulation project", description: "Work on a space simulation or data analysis project", time: "4 hours", difficulty: "hard" }
      ]
    }
  },
  "biotechnology": {
    id: "biotechnology", title: "Biotechnology", category: "MEDICAL", icon: "🧬",
    description: "Apply biological systems and living organisms to develop medicines, products, and technologies that improve human life.",
    whyImportant: "Biotechnology is revolutionizing medicine, agriculture, and environmental science, creating life-saving drugs and sustainable solutions.",
    avgSalary: "₹5L - ₹40L per year", jobDemand: "High",
    skills: { core: ["Molecular Biology", "Genetics", "Biochemistry", "Cell Biology", "Bioinformatics"], tools: ["PCR machines", "CRISPR tools", "Bioinformatics software", "Lab equipment", "Python/R"], soft: ["Curiosity", "Attention to Detail", "Patience", "Analytical Thinking", "Ethics"] },
    roadmap: {
      beginner: ["Complete B.Sc/B.Tech Biotechnology", "Learn molecular biology basics", "Lab techniques (PCR, gel electrophoresis)", "Bioinformatics basics", "Research internship"],
      intermediate: ["M.Sc/M.Tech specialization", "Advanced lab research", "Publish research papers", "Industry internship", "Learn CRISPR & gene editing"],
      advanced: ["PhD in specialized area", "Drug development research", "Biotech startup", "Clinical trials", "Lead research teams"]
    },
    tasks: {
      daily: [
        { title: "Study biology concept", description: "Learn one molecular biology or genetics concept", time: "1 hour", difficulty: "medium" },
        { title: "Lab journal", description: "Document lab procedures and observations", time: "30 min", difficulty: "easy" },
        { title: "Research reading", description: "Read one biotech research article", time: "30 min", difficulty: "medium" }
      ],
      weekly: [
        { title: "Lab experiment", description: "Conduct or analyze a biology experiment", time: "4 hours", difficulty: "hard" },
        { title: "Research review", description: "Review latest biotech developments in your area", time: "2 hours", difficulty: "medium" }
      ]
    }
  },
  "film-making": {
    id: "film-making", title: "Film Making", category: "CREATIVE", icon: "🎥",
    description: "Create cinematic stories through directing, screenwriting, cinematography, and post-production for films, web series, and digital content.",
    whyImportant: "Film is one of the most powerful storytelling mediums. The Indian film industry is a multi-billion dollar industry with global reach.",
    avgSalary: "₹3L - ₹2Cr+ per year", jobDemand: "Growing",
    skills: { core: ["Screenwriting", "Directing", "Cinematography", "Editing", "Storytelling"], tools: ["Adobe Premiere Pro", "DaVinci Resolve", "Final Cut Pro", "Cinema cameras", "After Effects"], soft: ["Creativity", "Leadership", "Vision", "Communication", "Resilience"] },
    roadmap: {
      beginner: ["Study film history and theory", "Learn basic camera operation", "Write short scripts", "Make short films with phone/camera", "Study great directors"],
      intermediate: ["Film school or online courses", "Assist on professional sets", "Direct short films", "Build portfolio", "Learn post-production"],
      advanced: ["Direct feature films or web series", "Film festival submissions", "Build industry network", "Own production house", "International collaborations"]
    },
    tasks: {
      daily: [
        { title: "Watch and analyze film", description: "Watch one film and analyze its direction/cinematography", time: "2 hours", difficulty: "easy" },
        { title: "Write script pages", description: "Write 3-5 pages of a screenplay", time: "45 min", difficulty: "medium" },
        { title: "Study technique", description: "Learn one filmmaking technique or concept", time: "30 min", difficulty: "easy" }
      ],
      weekly: [
        { title: "Shoot a scene", description: "Plan, shoot, and edit a short scene", time: "6 hours", difficulty: "hard" },
        { title: "Script review", description: "Write or revise a complete short script", time: "3 hours", difficulty: "medium" }
      ]
    }
  },
  "game-development": {
    id: "game-development", title: "Game Development", category: "TECH", icon: "🎮",
    description: "Design and build video games for PC, mobile, and consoles using game engines, programming, and creative design.",
    whyImportant: "The global gaming industry is worth $200B+. Game developers combine creativity and technology to build immersive experiences.",
    avgSalary: "₹4L - ₹40L per year", jobDemand: "High",
    skills: { core: ["C#/C++", "Unity/Unreal Engine", "Game Design", "Physics Simulation", "3D Modeling"], tools: ["Unity", "Unreal Engine", "Blender", "Visual Studio", "Git"], soft: ["Creativity", "Problem Solving", "Attention to Detail", "Teamwork", "Passion"] },
    roadmap: {
      beginner: ["Learn C# or C++ basics", "Start with Unity or Unreal Engine", "Build simple 2D games", "Understand game design principles", "Study game physics"],
      intermediate: ["Build 3D games", "Learn multiplayer networking", "Game monetization", "Publish on mobile/PC", "Build game portfolio"],
      advanced: ["AAA game development", "Game engine customization", "VR/AR games", "Lead game studio", "Own indie game company"]
    },
    tasks: {
      daily: [
        { title: "Code game feature", description: "Implement one game mechanic or feature", time: "1.5 hours", difficulty: "medium" },
        { title: "Play and analyze games", description: "Play a game and analyze its design decisions", time: "30 min", difficulty: "easy" },
        { title: "Study game dev tutorial", description: "Follow one game development tutorial", time: "45 min", difficulty: "medium" }
      ],
      weekly: [
        { title: "Build a game prototype", description: "Create a playable prototype of a game idea", time: "6 hours", difficulty: "hard" },
        { title: "Game jam", description: "Participate in a 48-hour game jam", time: "varies", difficulty: "hard" }
      ]
    }
  }
};

extraCareers["robotics"] = {
  id: "robotics", title: "Robotics", category: "TECH", icon: "🤖",
  description: "Design, build, and program robots and automated systems that perform tasks in manufacturing, healthcare, space, and daily life.",
  whyImportant: "Robotics is the future of automation. Robotics engineers are building the machines that will transform industries and human life.",
  avgSalary: "₹6L - ₹50L per year", jobDemand: "Very High",
  skills: { core: ["Mechanical Engineering", "Electronics", "Programming (Python/C++)", "Control Systems", "AI/ML"], tools: ["ROS (Robot Operating System)", "Arduino", "Raspberry Pi", "MATLAB", "SolidWorks"], soft: ["Problem Solving", "Creativity", "Analytical Thinking", "Teamwork", "Persistence"] },
  roadmap: {
    beginner: ["Learn Physics & Mathematics", "Study electronics basics", "Learn Python or C++", "Build simple Arduino projects", "Understand control systems"],
    intermediate: ["Learn ROS framework", "Build robotic arms or drones", "Computer vision for robots", "Internship at robotics company", "Participate in robotics competitions"],
    advanced: ["AI-powered robots", "Industrial automation", "Medical robotics", "Research & development", "Lead robotics teams"]
  },
  tasks: {
    daily: [
      { title: "Study robotics concept", description: "Learn one robotics or control systems concept", time: "1 hour", difficulty: "hard" },
      { title: "Code practice", description: "Write code for a robotic simulation", time: "45 min", difficulty: "medium" },
      { title: "Electronics practice", description: "Work on a small electronics circuit or project", time: "30 min", difficulty: "medium" }
    ],
    weekly: [
      { title: "Build robot component", description: "Design or build one component of a robot", time: "5 hours", difficulty: "hard" },
      { title: "Competition prep", description: "Prepare for a robotics competition or hackathon", time: "3 hours", difficulty: "hard" }
    ]
  }
};

extraCareers["psychology"] = {
  id: "psychology", title: "Psychology", category: "MEDICAL", icon: "🧠",
  description: "Study human behavior and mental processes to help individuals overcome challenges, improve mental health, and enhance well-being.",
  whyImportant: "Mental health is a global crisis. Psychologists are in growing demand across healthcare, corporate, education, and sports sectors.",
  avgSalary: "₹4L - ₹25L per year", jobDemand: "Growing Fast",
  skills: { core: ["Clinical Psychology", "Counseling", "Cognitive Behavioral Therapy", "Research Methods", "Assessment"], tools: ["DSM-5", "Psychological tests", "SPSS", "Therapy frameworks", "Case management software"], soft: ["Empathy", "Active Listening", "Communication", "Ethics", "Patience"] },
  roadmap: {
    beginner: ["Complete B.A./B.Sc Psychology", "Learn counseling basics", "Study human development", "Volunteer at mental health NGOs", "Learn research methods"],
    intermediate: ["M.A./M.Sc Clinical Psychology", "Supervised clinical practice", "Specialize (CBT, trauma, child psychology)", "Internship at hospital/clinic", "Research publications"],
    advanced: ["M.Phil/PhD Clinical Psychology", "RCI registration", "Private practice", "Corporate wellness consulting", "Academic teaching"]
  },
  tasks: {
    daily: [
      { title: "Study psychology concept", description: "Learn one psychological theory or therapy technique", time: "1 hour", difficulty: "medium" },
      { title: "Case study analysis", description: "Analyze a psychological case study", time: "45 min", difficulty: "medium" },
      { title: "Read mental health news", description: "Stay updated on mental health research and trends", time: "20 min", difficulty: "easy" }
    ],
    weekly: [
      { title: "Counseling practice", description: "Practice counseling skills with role-play or supervision", time: "3 hours", difficulty: "hard" },
      { title: "Research review", description: "Read and summarize a psychology research paper", time: "2 hours", difficulty: "medium" }
    ]
  }
};

extraCareers["architecture"] = {
  id: "architecture", title: "Architecture", category: "CREATIVE", icon: "🏛️",
  description: "Design buildings, spaces, and environments that are functional, beautiful, and sustainable for people and communities.",
  whyImportant: "Architects shape the physical world we live in. With rapid urbanization in India, skilled architects are in high demand.",
  avgSalary: "₹4L - ₹30L per year", jobDemand: "Stable High",
  skills: { core: ["Architectural Design", "Structural Engineering basics", "AutoCAD", "3D Modeling", "Urban Planning"], tools: ["AutoCAD", "Revit", "SketchUp", "3ds Max", "Adobe Suite"], soft: ["Creativity", "Attention to Detail", "Communication", "Problem Solving", "Visualization"] },
  roadmap: {
    beginner: ["Complete B.Arch (5 years)", "Learn AutoCAD & SketchUp", "Study architectural history", "Design small projects", "Internship at architecture firm"],
    intermediate: ["M.Arch specialization", "Work on real projects", "Learn sustainable design", "BIM (Building Information Modeling)", "Build portfolio"],
    advanced: ["Senior architect", "Own architecture firm", "Urban planning projects", "International projects", "Teach architecture"]
  },
  tasks: {
    daily: [
      { title: "Design practice", description: "Sketch or design one architectural element", time: "1 hour", difficulty: "medium" },
      { title: "Study great buildings", description: "Analyze one famous building's design and structure", time: "30 min", difficulty: "easy" },
      { title: "CAD practice", description: "Practice AutoCAD or Revit for 30 minutes", time: "30 min", difficulty: "medium" }
    ],
    weekly: [
      { title: "Design project", description: "Complete a full architectural design for a small building", time: "6 hours", difficulty: "hard" },
      { title: "Site visit", description: "Visit a construction site or architectural landmark", time: "2 hours", difficulty: "easy" }
    ]
  }
};

extraCareers["ecommerce"] = {
  id: "ecommerce", title: "E-commerce", category: "BUSINESS", icon: "🛒",
  description: "Build and scale online businesses selling products or services through platforms like Amazon, Flipkart, Shopify, or your own store.",
  whyImportant: "E-commerce is the fastest growing retail sector. India's e-commerce market is expected to reach $350B by 2030.",
  avgSalary: "₹3L - ₹50L+ per year", jobDemand: "Very High",
  skills: { core: ["Product Sourcing", "Digital Marketing", "Supply Chain", "Customer Experience", "Analytics"], tools: ["Shopify", "Amazon Seller Central", "Google Analytics", "Meta Ads", "Razorpay"], soft: ["Entrepreneurial Mindset", "Adaptability", "Data-Driven Thinking", "Communication", "Resilience"] },
  roadmap: {
    beginner: ["Understand e-commerce basics", "Choose a product niche", "Set up Shopify or Amazon store", "Learn product photography", "Run first ad campaign"],
    intermediate: ["Scale with paid ads", "Inventory management", "Customer retention strategies", "Multi-platform selling", "Build brand identity"],
    advanced: ["Own D2C brand", "International selling", "Warehouse & logistics", "Team building", "IPO or acquisition"]
  },
  tasks: {
    daily: [
      { title: "Check store analytics", description: "Review sales, traffic, and conversion metrics", time: "30 min", difficulty: "easy" },
      { title: "Optimize product listings", description: "Improve one product listing with better copy/images", time: "45 min", difficulty: "medium" },
      { title: "Customer service", description: "Respond to customer queries and reviews", time: "30 min", difficulty: "easy" }
    ],
    weekly: [
      { title: "Launch ad campaign", description: "Create and launch a new paid advertising campaign", time: "3 hours", difficulty: "medium" },
      { title: "Competitor analysis", description: "Analyze top competitors and identify opportunities", time: "2 hours", difficulty: "medium" }
    ]
  }
};

extraCareers["finance"] = {
  id: "finance", title: "Finance", category: "FINANCE", icon: "💰",
  description: "Manage money, investments, and financial planning for individuals, corporations, and institutions to maximize wealth and minimize risk.",
  whyImportant: "Finance is the backbone of every economy. Finance professionals are essential in banking, investment, insurance, and corporate sectors.",
  avgSalary: "₹5L - ₹50L per year", jobDemand: "Always High",
  skills: { core: ["Financial Analysis", "Accounting", "Investment Management", "Risk Assessment", "Financial Modeling"], tools: ["Excel", "Bloomberg", "Tally", "SAP", "Power BI"], soft: ["Analytical Thinking", "Attention to Detail", "Integrity", "Communication", "Decision Making"] },
  roadmap: {
    beginner: ["Complete B.Com/BBA Finance", "Learn Excel & financial modeling", "Understand financial statements", "Study taxation basics", "Internship at bank/NBFC"],
    intermediate: ["CA/CFA/MBA Finance", "Corporate finance roles", "Investment analysis", "Risk management", "Financial planning"],
    advanced: ["CFO track", "Fund management", "Investment banking", "Own financial advisory firm", "Board-level finance roles"]
  },
  tasks: {
    daily: [
      { title: "Read financial news", description: "Follow market news on ET/Bloomberg/Moneycontrol", time: "30 min", difficulty: "easy" },
      { title: "Financial modeling", description: "Practice building or updating a financial model", time: "1 hour", difficulty: "medium" },
      { title: "Study finance concept", description: "Learn one financial concept or regulation", time: "30 min", difficulty: "medium" }
    ],
    weekly: [
      { title: "Portfolio review", description: "Analyze and review an investment portfolio", time: "2 hours", difficulty: "medium" },
      { title: "Case study", description: "Analyze a real company's financial performance", time: "3 hours", difficulty: "hard" }
    ]
  }
};

extraCareers["stock-market"] = {
  id: "stock-market", title: "Stock Market", category: "FINANCE", icon: "📊",
  description: "Invest and trade in equities, derivatives, and financial instruments to build wealth through market knowledge and strategy.",
  whyImportant: "The stock market is the primary wealth creation vehicle. Understanding it opens doors to financial freedom and investment careers.",
  avgSalary: "₹0 - Unlimited (performance-based)", jobDemand: "Self-Created",
  skills: { core: ["Technical Analysis", "Fundamental Analysis", "Options Trading", "Risk Management", "Market Psychology"], tools: ["Zerodha Kite", "TradingView", "Screener.in", "Sensibull", "Bloomberg"], soft: ["Discipline", "Emotional Control", "Patience", "Analytical Thinking", "Risk Tolerance"] },
  roadmap: {
    beginner: ["Open Demat account", "Learn stock market basics", "Understand candlestick charts", "Paper trading practice", "Study risk management"],
    intermediate: ["Technical analysis mastery", "Options & futures basics", "Develop trading strategy", "Backtest strategies", "Trade with small capital"],
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
      { title: "Backtest strategy", description: "Backtest a new trading strategy on historical data", time: "3 hours", difficulty: "hard" }
    ]
  }
};

extraCareers["blockchain"] = {
  id: "blockchain", title: "Blockchain", category: "TECH", icon: "⛓️",
  description: "Build decentralized applications, smart contracts, and blockchain infrastructure that powers Web3, DeFi, and digital assets.",
  whyImportant: "Blockchain is disrupting finance, supply chain, healthcare, and governance. Web3 developers are among the highest paid in tech.",
  avgSalary: "₹8L - ₹80L per year", jobDemand: "High",
  skills: { core: ["Solidity", "Smart Contracts", "Ethereum", "Web3.js", "Cryptography"], tools: ["Hardhat", "Truffle", "MetaMask", "IPFS", "Remix IDE"], soft: ["Analytical Thinking", "Security Mindset", "Continuous Learning", "Problem Solving", "Innovation"] },
  roadmap: {
    beginner: ["Learn blockchain fundamentals", "Understand Bitcoin & Ethereum", "Learn Solidity basics", "Deploy first smart contract", "Study DeFi concepts"],
    intermediate: ["Build DApps (Decentralized Apps)", "NFT development", "DeFi protocols", "Security auditing basics", "Web3 frontend integration"],
    advanced: ["Layer 2 solutions", "Cross-chain development", "DAO governance", "Blockchain security auditing", "Launch own protocol"]
  },
  tasks: {
    daily: [
      { title: "Code smart contract", description: "Write or improve a Solidity smart contract", time: "1 hour", difficulty: "hard" },
      { title: "Follow crypto news", description: "Stay updated on blockchain and Web3 developments", time: "20 min", difficulty: "easy" },
      { title: "Study blockchain concept", description: "Learn one blockchain protocol or concept", time: "30 min", difficulty: "medium" }
    ],
    weekly: [
      { title: "Build DApp feature", description: "Add a feature to a decentralized application", time: "5 hours", difficulty: "hard" },
      { title: "Security review", description: "Audit a smart contract for vulnerabilities", time: "3 hours", difficulty: "hard" }
    ]
  }
};

extraCareers["cyber-law"] = {
  id: "cyber-law", title: "Cyber Law", category: "GOVERNMENT", icon: "⚖️",
  description: "Practice law in the digital domain — handling cybercrime, data privacy, intellectual property, and digital contracts.",
  whyImportant: "As the digital economy grows, cyber law is one of the fastest growing legal specializations with massive demand from corporations and governments.",
  avgSalary: "₹5L - ₹40L per year", jobDemand: "Growing Fast",
  skills: { core: ["IT Act 2000", "Data Privacy Laws", "Cybercrime Investigation", "Intellectual Property", "Digital Contracts"], tools: ["Legal research databases", "Forensic tools", "Case management software"], soft: ["Analytical Thinking", "Communication", "Ethics", "Attention to Detail", "Continuous Learning"] },
  roadmap: {
    beginner: ["Complete LLB degree", "Study IT Act 2000 & GDPR", "Learn cybercrime basics", "Internship at cyber law firm", "Study data privacy regulations"],
    intermediate: ["LLM in Cyber Law/IT Law", "Handle cybercrime cases", "Corporate data compliance", "Intellectual property cases", "Build legal network"],
    advanced: ["Senior cyber law advocate", "Corporate legal counsel", "Government cyber policy", "International cyber law", "Own cyber law firm"]
  },
  tasks: {
    daily: [
      { title: "Study cyber law case", description: "Analyze one cybercrime or data privacy case", time: "1 hour", difficulty: "medium" },
      { title: "Read tech-law news", description: "Follow latest developments in cyber law and regulations", time: "30 min", difficulty: "easy" },
      { title: "Legal research", description: "Research one cyber law topic or regulation", time: "45 min", difficulty: "medium" }
    ],
    weekly: [
      { title: "Case study", description: "Write a detailed analysis of a cyber law case", time: "3 hours", difficulty: "hard" },
      { title: "Mock legal brief", description: "Draft a legal brief for a hypothetical cyber case", time: "2 hours", difficulty: "hard" }
    ]
  }
};

extraCareers["environmental-science"] = {
  id: "environmental-science", title: "Environmental Science", category: "TECH", icon: "🌿",
  description: "Study and protect the natural environment through research, policy, and sustainable solutions to climate change and pollution.",
  whyImportant: "Climate change is the defining challenge of our era. Environmental scientists are critical to building a sustainable future.",
  avgSalary: "₹4L - ₹25L per year", jobDemand: "Growing",
  skills: { core: ["Ecology", "Climate Science", "Environmental Policy", "GIS & Remote Sensing", "Data Analysis"], tools: ["ArcGIS", "QGIS", "Python", "R", "Environmental monitoring equipment"], soft: ["Curiosity", "Analytical Thinking", "Communication", "Advocacy", "Resilience"] },
  roadmap: {
    beginner: ["Complete B.Sc Environmental Science", "Learn GIS basics", "Study ecology and climate science", "Volunteer with environmental NGOs", "Field research experience"],
    intermediate: ["M.Sc Environmental Science", "Environmental impact assessments", "Policy research", "Climate data analysis", "Research publications"],
    advanced: ["PhD research", "Environmental consulting", "Government policy roles", "International climate organizations", "Lead sustainability programs"]
  },
  tasks: {
    daily: [
      { title: "Study environmental topic", description: "Learn one climate or environmental science concept", time: "1 hour", difficulty: "medium" },
      { title: "Follow climate news", description: "Read about latest environmental developments", time: "20 min", difficulty: "easy" },
      { title: "Data analysis practice", description: "Analyze environmental dataset using Python/R", time: "45 min", difficulty: "medium" }
    ],
    weekly: [
      { title: "Research paper", description: "Read and summarize an environmental research paper", time: "2 hours", difficulty: "medium" },
      { title: "Field observation", description: "Conduct a local environmental observation or survey", time: "3 hours", difficulty: "medium" }
    ]
  }
};

extraCareers["music-industry"] = {
  id: "music-industry", title: "Music Industry", category: "CREATIVE", icon: "🎵",
  description: "Build a career in music as a singer, musician, music producer, composer, or music business professional.",
  whyImportant: "Music is a universal language. The Indian music industry is booming with streaming, Bollywood, independent music, and live events.",
  avgSalary: "₹2L - ₹10Cr+ per year", jobDemand: "Competitive but Growing",
  skills: { core: ["Music Theory", "Vocal/Instrumental Skills", "Music Production", "Songwriting", "Performance"], tools: ["DAW (FL Studio/Ableton/Logic Pro)", "Audio interfaces", "MIDI controllers", "Spotify for Artists", "YouTube"], soft: ["Creativity", "Discipline", "Resilience", "Networking", "Emotional Expression"] },
  roadmap: {
    beginner: ["Learn an instrument or vocal training", "Study music theory basics", "Record first demos", "Build social media presence", "Perform at local events"],
    intermediate: ["Music production skills", "Release original music", "Collaborate with other artists", "Build fanbase", "Music licensing basics"],
    advanced: ["Record label deals or independent label", "National/international tours", "Film/TV music scoring", "Music business ventures", "Mentor emerging artists"]
  },
  tasks: {
    daily: [
      { title: "Practice instrument/vocals", description: "Practice your instrument or vocal exercises", time: "1 hour", difficulty: "medium" },
      { title: "Music production", description: "Work on a beat, melody, or song production", time: "1 hour", difficulty: "medium" },
      { title: "Listen and analyze", description: "Listen to 3 songs and analyze their composition", time: "30 min", difficulty: "easy" }
    ],
    weekly: [
      { title: "Complete a song", description: "Write, produce, and record a complete song", time: "6 hours", difficulty: "hard" },
      { title: "Perform or collaborate", description: "Perform live or collaborate with another artist", time: "3 hours", difficulty: "medium" }
    ]
  }
};

extraCareers["dance-industry"] = {
  id: "dance-industry", title: "Dance Industry", category: "CREATIVE", icon: "💃",
  description: "Build a career in dance as a performer, choreographer, dance teacher, or dance content creator across classical, contemporary, and commercial styles.",
  whyImportant: "Dance is a powerful art form and career. From Bollywood to international stages, skilled dancers and choreographers are always in demand.",
  avgSalary: "₹2L - ₹50L+ per year", jobDemand: "Growing",
  skills: { core: ["Dance Technique", "Choreography", "Rhythm & Musicality", "Performance", "Teaching"], tools: ["Video editing software", "Social media platforms", "Dance studio equipment", "Music software"], soft: ["Discipline", "Creativity", "Physical Fitness", "Expression", "Resilience"] },
  roadmap: {
    beginner: ["Learn one dance form (Bharatanatyam/Hip-hop/Contemporary)", "Daily practice routine", "Perform at school/local events", "Study music and rhythm", "Build social media presence"],
    intermediate: ["Advanced training in multiple styles", "Choreograph for events", "Teach dance classes", "Audition for shows/films", "Build YouTube/Instagram following"],
    advanced: ["Professional performer/choreographer", "Bollywood/international projects", "Own dance academy", "Reality show judge/mentor", "International dance tours"]
  },
  tasks: {
    daily: [
      { title: "Dance practice", description: "Practice your dance form for at least 1 hour", time: "1 hour", difficulty: "medium" },
      { title: "Choreography work", description: "Create or refine a choreography piece", time: "45 min", difficulty: "medium" },
      { title: "Watch performances", description: "Watch and analyze professional dance performances", time: "30 min", difficulty: "easy" }
    ],
    weekly: [
      { title: "Create content", description: "Film and post a dance video on social media", time: "3 hours", difficulty: "medium" },
      { title: "Teach or perform", description: "Teach a class or perform at an event", time: "2 hours", difficulty: "medium" }
    ]
  }
};

extraCareers["sports-science"] = {
  id: "sports-science", title: "Sports Science", category: "MEDICAL", icon: "🏆",
  description: "Apply science to optimize athletic performance, prevent injuries, and improve physical fitness for athletes and sports teams.",
  whyImportant: "Sports science is transforming how athletes train and recover. India's growing sports ecosystem needs qualified sports scientists.",
  avgSalary: "₹4L - ₹25L per year", jobDemand: "Growing",
  skills: { core: ["Exercise Physiology", "Biomechanics", "Sports Nutrition", "Strength & Conditioning", "Sports Psychology"], tools: ["Performance analysis software", "Wearable tech", "Lab equipment", "Video analysis tools"], soft: ["Analytical Thinking", "Communication", "Motivation", "Teamwork", "Adaptability"] },
  roadmap: {
    beginner: ["Complete B.Sc Sports Science/Physical Education", "Learn exercise physiology basics", "Sports nutrition fundamentals", "Work with local sports teams", "Get fitness certifications"],
    intermediate: ["M.Sc Sports Science", "Strength & conditioning coaching", "Sports injury prevention", "Work with professional athletes", "Research projects"],
    advanced: ["Work with national sports teams", "PhD in sports science", "Sports performance consulting", "Own sports academy", "International sports organizations"]
  },
  tasks: {
    daily: [
      { title: "Study sports science concept", description: "Learn one exercise physiology or biomechanics concept", time: "1 hour", difficulty: "medium" },
      { title: "Athlete assessment", description: "Analyze an athlete's performance data or video", time: "45 min", difficulty: "medium" },
      { title: "Fitness practice", description: "Apply sports science principles to your own training", time: "1 hour", difficulty: "medium" }
    ],
    weekly: [
      { title: "Training program design", description: "Design a complete training program for an athlete", time: "3 hours", difficulty: "hard" },
      { title: "Research review", description: "Read and summarize a sports science research paper", time: "2 hours", difficulty: "medium" }
    ]
  }
};

extraCareers["fitness-industry"] = {
  id: "fitness-industry", title: "Fitness Industry", category: "MEDICAL", icon: "💪",
  description: "Help people achieve their health and fitness goals as a personal trainer, fitness coach, nutritionist, or gym owner.",
  whyImportant: "Health consciousness is rising globally. The fitness industry is a multi-billion dollar sector with massive growth in India.",
  avgSalary: "₹3L - ₹30L+ per year", jobDemand: "Very High",
  skills: { core: ["Personal Training", "Nutrition", "Exercise Programming", "Anatomy & Physiology", "Coaching"], tools: ["Fitness apps", "Wearable trackers", "Gym equipment", "MyFitnessPal", "Trainerize"], soft: ["Motivation", "Empathy", "Communication", "Discipline", "Adaptability"] },
  roadmap: {
    beginner: ["Get certified (ACE/NASM/ISSA)", "Learn anatomy & physiology", "Study nutrition basics", "Train clients at local gym", "Build social media presence"],
    intermediate: ["Specialize (bodybuilding/yoga/CrossFit)", "Online coaching", "Nutrition certification", "Build client base", "Create fitness content"],
    advanced: ["Own gym or fitness studio", "Online fitness brand", "Corporate wellness programs", "Fitness influencer", "Franchise model"]
  },
  tasks: {
    daily: [
      { title: "Train clients", description: "Conduct personal training sessions", time: "2 hours", difficulty: "medium" },
      { title: "Create fitness content", description: "Post one fitness tip or workout video", time: "30 min", difficulty: "easy" },
      { title: "Study fitness topic", description: "Learn one new training or nutrition concept", time: "30 min", difficulty: "easy" }
    ],
    weekly: [
      { title: "Program design", description: "Create a complete 4-week training program for a client", time: "3 hours", difficulty: "medium" },
      { title: "Business development", description: "Reach out to 5 potential clients or partners", time: "2 hours", difficulty: "medium" }
    ]
  }
};

extraCareers["content-economy"] = {
  id: "content-economy", title: "Content Economy", category: "FREELANCE", icon: "📱",
  description: "Build a sustainable income through content creation across YouTube, Instagram, podcasts, newsletters, and digital products.",
  whyImportant: "The creator economy is worth $250B+ globally. Millions of creators are building full-time incomes through content and community.",
  avgSalary: "₹1L - ₹10Cr+ per year", jobDemand: "Self-Created",
  skills: { core: ["Content Strategy", "Video/Audio Production", "Audience Building", "Monetization", "Personal Branding"], tools: ["YouTube Studio", "Instagram", "Substack", "Gumroad", "Canva"], soft: ["Consistency", "Creativity", "Authenticity", "Resilience", "Business Mindset"] },
  roadmap: {
    beginner: ["Choose your niche and platform", "Create first 10 pieces of content", "Learn basic video/audio editing", "Understand platform algorithms", "Build first 100 followers"],
    intermediate: ["Consistent posting schedule", "Monetize (ads/sponsorships/products)", "Email list building", "Collaborate with other creators", "Diversify platforms"],
    advanced: ["Multiple revenue streams", "Digital products & courses", "Own media brand", "Team of creators", "Speaking & consulting"]
  },
  tasks: {
    daily: [
      { title: "Create content", description: "Create one piece of content for your platform", time: "1 hour", difficulty: "medium" },
      { title: "Engage community", description: "Reply to comments and engage with your audience", time: "20 min", difficulty: "easy" },
      { title: "Study analytics", description: "Review your content performance metrics", time: "15 min", difficulty: "easy" }
    ],
    weekly: [
      { title: "Long-form content", description: "Create one long-form video, podcast, or article", time: "5 hours", difficulty: "medium" },
      { title: "Monetization review", description: "Review and optimize your revenue streams", time: "2 hours", difficulty: "medium" }
    ]
  }
};

module.exports = extraCareers;
