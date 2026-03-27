// Krishna AI Gamification System
// Tracks: Streak, Levels, XP, Certificates, Achievements

const GAMIFICATION = {
  // XP requirements per level
  xpRequirements: {
    1: 100, 2: 200, 3: 300, 4: 400, 5: 500,
    6: 700, 7: 900, 8: 1100, 9: 1300, 10: 1500,
    11: 2000, 12: 2500, 13: 3000, 14: 3500, 15: 4000
  },

  // Streak requirements for level up
  streakRequirements: {
    1: 5, 2: 5, 3: 5, 4: 5, 5: 5,  // Levels 1-5: need 5 streak
    6: 7, 7: 7, 8: 7, 9: 7, 10: 7,  // Levels 6-10: need 7 streak
    11: 10, 12: 10, 13: 10, 14: 10, 15: 10  // Levels 11-15: need 10 streak
  },

  // Krishna motivation messages
  messages: {
    streakUp: [
      "🪷 Your discipline grows. Continue your dharma.",
      "🔥 The fire of commitment burns bright within you.",
      "✨ Every action builds your inner strength.",
      "🙏 Consistency is the truest worship.",
      "💪 You are becoming the person you wish to be."
    ],
    levelUp: [
      "🪷 You have evolved to a higher plane. Level {LEVEL} achieved!",
      "🏆 Through disciplined action, mastery unfolds. Level {LEVEL}!",
      "⭐ You walk the path of the warrior. Level {LEVEL}!",
      "🔱 Your dedication bore fruit. Level {LEVEL}!",
      "🌟 The universe bows to your commitment. Level {LEVEL}!"
    ],
    certificate: [
      "🏆 10 Levels mastered! A certificate of discipline awaits.",
      "🪷 Your journey reaches a milestone. Certificate unlocked!",
      "✨ Prove your mastery. Download your certificate."
    ]
  },

  // Initialize or get user progression
  init() {
    const existing = localStorage.getItem('krishna_progression');
    if (existing) return JSON.parse(existing);

    const progression = {
      streak: 0,
      level: 1,
      xp: 0,
      completedTasks: [],
      lastCompletedDate: null,
      certificatesEarned: [],
      totalXpGained: 0
    };
    this.save(progression);
    return progression;
  },

  save(data) {
    localStorage.setItem('krishna_progression', JSON.stringify(data));
  },

  get() {
    return JSON.parse(localStorage.getItem('krishna_progression') || '{}');
  },

  // Add XP from task completion
  addXP(xpAmount, taskName) {
    const prog = this.get();
    prog.xp += xpAmount;
    prog.totalXpGained += xpAmount;
    prog.completedTasks.push({ task: taskName, date: new Date().toISOString() });

    // Check for level up
    const neededXp = this.xpRequirements[prog.level] || 5000;
    if (prog.xp >= neededXp) {
      return this.levelUp();
    }

    this.save(prog);
    return { leveledUp: false, message: null };
  },

  // Level up logic
  levelUp() {
    const prog = this.get();
    prog.level += 1;
    prog.xp = 0;  // Reset XP for new level

    const msg = this.randomMessage('levelUp').replace('{LEVEL}', prog.level);
    
    // Check for certificate milestone
    if (prog.level % 10 === 0 && prog.level > 0) {
      prog.certificatesEarned.push({
        level: prog.level,
        earnedDate: new Date().toISOString()
      });
    }

    this.save(prog);
    return { leveledUp: true, message: msg, newLevel: prog.level };
  },

  // Update streak based on task completion
  updateStreak(tasksCompleted, totalTasks) {
    const prog = this.get();
    const today = new Date().toDateString();
    const lastDate = prog.lastCompletedDate ? new Date(prog.lastCompletedDate).toDateString() : null;

    // Full completion today
    if (tasksCompleted === totalTasks) {
      if (lastDate !== today) {
        // Check if this is the next day
        if (lastDate) {
          const last = new Date(prog.lastCompletedDate);
          const now = new Date();
          const daysDiff = Math.floor((now - last) / (1000 * 60 * 60 * 24));

          if (daysDiff === 1) {
            // Continue streak
            prog.streak += 1;
            const msg = this.randomMessage('streakUp');
            this.save(prog);
            return { streakContinued: true, oldStreak: prog.streak - 1, newStreak: prog.streak, message: msg };
          } else if (daysDiff > 1) {
            // Streak broken - check if warning or reset
            if (daysDiff === 2) {
              // Warning stage
              prog.streak = Math.max(0, prog.streak - 1);
              this.save(prog);
              return { streakWarning: true, streak: prog.streak, message: "⚠️ Streak at risk! Complete tasks tomorrow to save it." };
            } else {
              // Reset
              prog.streak = 0;
              this.save(prog);
              return { streakReset: true, message: "🔄 Streak reset. Start anew with dedication!" };
            }
          }
        } else {
          // First completion
          prog.streak = 1;
          const msg = this.randomMessage('streakUp');
          this.save(prog);
          return { streakStarted: true, streak: 1, message: msg };
        }
      }
    }

    prog.lastCompletedDate = new Date().toISOString();
    this.save(prog);
    return { streakUpdated: false };
  },

  // Get random motivation message
  randomMessage(category) {
    const messages = this.messages[category] || [];
    return messages[Math.floor(Math.random() * messages.length)];
  },

  // Calculate XP progress to next level
  getXpProgress() {
    const prog = this.get();
    const nextLevelXp = this.xpRequirements[prog.level] || 5000;
    const percentage = Math.min(100, Math.round((prog.xp / nextLevelXp) * 100));
    return { current: prog.xp, needed: nextLevelXp, percentage };
  },

  // Generate certificate
  generateCertificate(userName, goalName) {
    const prog = this.get();
    return {
      id: Math.random().toString(36).substring(7),
      userName: userName || "Seeker",
      goalName: goalName || "Personal Growth",
      level: prog.level,
      earnedDate: new Date().toLocaleDateString(),
      xpTotal: prog.totalXpGained
    };
  },

  // Check if user has earned certificate
  hasCertificate() {
    const prog = this.get();
    return prog.level >= 10;
  },

  // Get all progression data
  getProgressData() {
    const prog = this.get();
    const xpData = this.getXpProgress();
    return {
      ...prog,
      ...xpData,
      streakRequiredForLevel: this.streakRequirements[prog.level] || 10,
      canEarnCertificate: this.hasCertificate()
    };
  }
};

// Initialize on load
window.addEventListener('DOMContentLoaded', function() {
  GAMIFICATION.init();
});
