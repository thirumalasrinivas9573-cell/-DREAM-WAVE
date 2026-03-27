const express = require('express');
const auth = require('../middleware/auth');
// MongoDB removed for demo mode. No model needed.

const router = express.Router();
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

async function callAI(prompt, maxTokens = 1200) {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7
    })
  });
  if (!res.ok) throw new Error('OpenAI error');
  const data = await res.json();
  return data.choices[0].message.content;
}

// ── Generate daily tasks for user based on goal + progress ──
router.post('/generate-tasks', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const goal = user.goal || user.ambition || req.body.goal;
    if (!goal) return res.status(400).json({ message: 'No goal set. Please set your ambition first.' });

    const today = new Date().toISOString().split('T')[0];

    // Check if tasks already generated today
    const existing = await Task.find({ userId: req.userId, date: today, aiGenerated: true });
    if (existing.length > 0) {
      return res.json({ tasks: existing, message: 'Tasks already generated for today', alreadyGenerated: true });
    }

    // Get completed tasks count for difficulty scaling
    const completedCount = await Task.countDocuments({ userId: req.userId, status: 'completed' });
    const difficulty = completedCount >= 30 ? 'hard' : completedCount >= 10 ? 'medium' : 'easy';

    const prompt = `You are an AI mentor for Dream Wave career platform.
User goal: "${goal}"
Tasks completed so far: ${completedCount}
Current difficulty level: ${difficulty}
Today's date: ${today}

Generate exactly 5 daily tasks for this user. Return ONLY valid JSON array, no markdown, no explanation.
Format:
[
  {
    "title": "Task title",
    "description": "What to do in 1-2 sentences",
    "type": "learning|practice|revision|quiz",
    "difficulty": "easy|medium|hard",
    "points": 10
  }
]
Rules:
- Mix task types: 2 learning, 1 practice, 1 revision, 1 quiz
- Points: easy=10, medium=20, hard=30
- Tasks must be specific and actionable for "${goal}"
- Increase difficulty as user progresses`;

    let tasksData;
    try {
      const raw = await callAI(prompt, 800);
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      tasksData = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch (e) {
      // Fallback tasks
      tasksData = [
        { title: `Study core concepts of ${goal}`, description: 'Read and take notes on fundamentals', type: 'learning', difficulty: 'easy', points: 10 },
        { title: `Practice ${goal} exercise`, description: 'Apply what you learned in a hands-on exercise', type: 'practice', difficulty: 'medium', points: 20 },
        { title: `Revise yesterday's material`, description: 'Review your notes from the previous session', type: 'revision', difficulty: 'easy', points: 10 },
        { title: `Watch a ${goal} tutorial`, description: 'Find and watch a 20-minute tutorial on YouTube', type: 'learning', difficulty: 'easy', points: 10 },
        { title: `Quiz yourself on ${goal}`, description: 'Test your knowledge with 10 questions', type: 'quiz', difficulty: difficulty, points: difficulty === 'hard' ? 30 : 20 }
      ];
    }

    // Save tasks to DB
    const savedTasks = await Task.insertMany(
      tasksData.slice(0, 5).map(t => ({
        userId: req.userId,
        careerId: goal,
        title: t.title,
        description: t.description || '',
        type: t.type || 'learning',
        difficulty: t.difficulty || difficulty,
        points: t.points || 10,
        status: 'pending',
        date: today,
        aiGenerated: true
      }))
    );

    res.json({ tasks: savedTasks, message: 'Daily tasks generated!', goal });
  } catch (err) {
    console.error('Generate tasks error:', err.message);
    res.status(500).json({ message: 'Error generating tasks', error: err.message });
  }
});

// ── Get today's tasks ──
router.get('/tasks/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const tasks = await Task.find({ userId: req.userId, date: today }).sort({ createdAt: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Complete a task + award credits ──
router.put('/task/:id/complete', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.status === 'completed') return res.json({ message: 'Already completed', task });

    task.status = 'completed';
    await task.save();

    const user = await User.findById(req.userId);
    user.points = (user.points || 0) + task.points;
    user.credits = (user.credits || 0) + task.points;
    await user.save();

    res.json({ message: 'Task completed! 🎉', points: task.points, totalCredits: user.credits, task });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Generate AI timetable based on goal ──
router.post('/timetable/generate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const goal = user.goal || user.ambition || req.body.goal;
    if (!goal) return res.status(400).json({ message: 'No goal set' });

    const hoursPerDay = req.body.hoursPerDay || 4;

    const prompt = `Create a daily study timetable for someone pursuing "${goal}" with ${hoursPerDay} hours available per day.
Return ONLY a JSON array, no markdown:
[
  { "time": "6:00 AM", "activity": "Morning revision", "duration": "30 min", "type": "revision" },
  ...
]
Include 6-8 time slots. Mix: study, practice, breaks, review. Be specific to "${goal}".`;

    let schedule;
    try {
      const raw = await callAI(prompt, 600);
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      schedule = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      schedule = [
        { time: '6:00 AM', activity: `📖 Study ${goal} basics`, duration: '1 hr', type: 'learning' },
        { time: '8:00 AM', activity: '🍳 Breakfast break', duration: '30 min', type: 'break' },
        { time: '8:30 AM', activity: `💻 Practice exercises`, duration: '1.5 hrs', type: 'practice' },
        { time: '12:00 PM', activity: '🍽️ Lunch break', duration: '45 min', type: 'break' },
        { time: '3:00 PM', activity: `📝 Revision session`, duration: '1 hr', type: 'revision' },
        { time: '6:00 PM', activity: `🤖 AI Mentor chat`, duration: '30 min', type: 'mentor' },
        { time: '9:00 PM', activity: '🌙 Review & plan tomorrow', duration: '30 min', type: 'review' }
      ];
    }

    // Save timetable to user
    user.timetable = schedule;
    await user.save();

    res.json({ timetable: schedule, goal });
  } catch (err) {
    res.status(500).json({ message: 'Error generating timetable', error: err.message });
  }
});

// ── Get timetable ──
router.get('/timetable', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ timetable: user.timetable || null });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Get daily progress summary + AI motivation message ──
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const today = new Date().toISOString().split('T')[0];

    const todayTasks = await Task.find({ userId: req.userId, date: today });
    const completedToday = todayTasks.filter(t => t.status === 'completed').length;
    const totalToday = todayTasks.length;
    const allCompleted = await Task.countDocuments({ userId: req.userId, status: 'completed' });

    // Generate motivation message
    const goal = user.goal || user.ambition || 'your goal';
    let motivation = '';
    try {
      const prompt = `User is pursuing "${goal}". Today they completed ${completedToday}/${totalToday} tasks. Total completed: ${allCompleted}. Streak: ${user.streak || 0} days.
Write a short (2 sentences max) motivational message. Be warm, specific, and encouraging. No emojis overload.`;
      motivation = await callAI(prompt, 100);
    } catch {
      motivation = completedToday === totalToday && totalToday > 0
        ? `Amazing work today! You completed all ${totalToday} tasks — keep this momentum going! 🚀`
        : `You're making progress on your journey to become a ${goal}. Every task completed brings you closer! 💪`;
    }

    res.json({
      today: { completed: completedToday, total: totalToday, tasks: todayTasks },
      allTime: { completed: allCompleted },
      credits: user.credits || 0,
      points: user.points || 0,
      streak: user.streak || 0,
      goal: goal === 'your goal' ? '' : goal,
      goalLocked: !!(user.goalLocked && (user.goal || user.ambition)),
      motivation
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Save onboarding data + optionally generate R&D report ──
router.post('/onboard', auth, async (req, res) => {
  try {
    const { goal, age, education, skills, hoursPerDay, wantsReport } = req.body;
    if (!goal) return res.status(400).json({ message: 'Goal is required' });

    const updateData = {
      goal, ambition: goal, careerGoals: goal,
      goalLocked: false
    };
    if (age)         updateData.age = age;
    if (education)   updateData.education = education;
    if (skills)      updateData.skills = Array.isArray(skills) ? skills : [skills];
    if (hoursPerDay) updateData.hoursPerDay = hoursPerDay;

    await User.findByIdAndUpdate(req.userId, updateData);

    let report = null;
    if (wantsReport) {
      try {
        const prompt = `Create a concise career roadmap report for: "${goal}"
User profile: Age ${age || 'unknown'}, Education: ${education || 'unknown'}, Skills: ${skills || 'none listed'}, Study hours/day: ${hoursPerDay || 2}

Include:
1. Career Overview (2-3 sentences)
2. Required Skills (bullet list)
3. Learning Timeline (3 phases with duration)
4. Daily Learning Path
5. Top Resources

Keep it under 600 words, practical and motivating.`;
        report = await callAI(prompt, 900);
      } catch (e) {
        report = `Your journey to become a ${goal} starts now! Focus on building core skills daily, stay consistent, and use the AI Mentor to guide your progress step by step.`;
      }
    }

    res.json({ message: 'Onboarding complete', goal, report });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── Lock goal ──
router.post('/lock-goal', auth, async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ message: 'Goal required' });
    await User.findByIdAndUpdate(req.userId, { goal, ambition: goal, goalLocked: true });
    res.json({ message: 'Goal locked!', goal });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Unlock goal ──
router.post('/unlock-goal', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { goalLocked: false });
    res.json({ message: 'Goal unlocked' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Get daily mission (single most important task) ──
router.get('/daily-mission', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    // Priority: hard > medium > easy, prefer incomplete
    const task = await Task.findOne({ userId: req.userId, date: today, status: 'pending' })
      .sort({ points: -1 });
    if (!task) {
      const completed = await Task.findOne({ userId: req.userId, date: today, status: 'completed' })
        .sort({ points: -1 });
      return res.json({ mission: completed || null, allDone: !!completed });
    }
    res.json({ mission: task, allDone: false });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── AI daily check-in message ──
router.get('/checkin', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = await Task.find({ userId: req.userId, date: today });
    const completedToday = todayTasks.filter(t => t.status === 'completed').length;
    const goal = user.goal || user.ambition || 'your career goal';

    const prompt = `You are an AI mentor for Dream Wave. User is pursuing "${goal}".
Today: ${completedToday}/${todayTasks.length} tasks done. Streak: ${user.streak || 0} days. Credits: ${user.credits || 0}.
Write a friendly daily check-in message (3-4 sentences). Mention their progress, encourage them, and give one specific tip for "${goal}" today.`;

    let message = '';
    try {
      message = await callAI(prompt, 200);
    } catch {
      message = `Good day! You're on a ${user.streak || 0}-day streak pursuing ${goal}. Keep completing your daily tasks to earn credits and level up. Today's focus: stay consistent and make progress, no matter how small!`;
    }

    res.json({ message, goal, streak: user.streak || 0, credits: user.credits || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
