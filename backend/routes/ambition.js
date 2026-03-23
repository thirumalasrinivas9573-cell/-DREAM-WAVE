const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const careers = require('../data/careers');

const router = express.Router();

// Get all careers
router.get('/', (req, res) => {
  const careerList = Object.values(careers).map(c => ({
    id: c.id, title: c.title, category: c.category, icon: c.icon,
    description: c.description, avgSalary: c.avgSalary, jobDemand: c.jobDemand
  }));
  res.json(careerList);
});

// Save user ambition (by careerId)
router.post('/select', auth, async (req, res) => {
  try {
    const { careerId } = req.body;
    const career = careers[careerId];
    if (!career) return res.status(404).json({ message: 'Career not found' });
    await User.findByIdAndUpdate(req.userId, { ambition: careerId, goal: career.title });
    res.json({ message: 'Ambition saved', career });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save user ambition (free text from ambition.html)
router.post('/set', auth, async (req, res) => {
  try {
    const { ambition, level, hoursPerDay } = req.body;
    await User.findByIdAndUpdate(req.userId, { ambition, goal: ambition, careerGoals: ambition });
    res.json({ message: 'Ambition saved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete a task
router.post('/task/complete', auth, async (req, res) => {
  try {
    const { careerId, taskTitle } = req.body;
    const user = await User.findById(req.userId);

    if (!user.progress) user.progress = {};
    if (!user.progress[careerId]) user.progress[careerId] = { completedTasks: [], points: 0 };

    if (!user.progress[careerId].completedTasks.includes(taskTitle)) {
      user.progress[careerId].completedTasks.push(taskTitle);
      user.progress[careerId].points += 10;
      user.points = (user.points || 0) + 10;
    }

    user.markModified('progress');
    await user.save();

    const totalTasks = user.progress[careerId].completedTasks.length;
    let certificate = null;
    if (totalTasks >= 100) certificate = 'Master';
    else if (totalTasks >= 50) certificate = 'Intermediate';
    else if (totalTasks >= 10) certificate = 'Beginner';

    if (certificate) {
      const badgeKey = `${certificate} - ${careerId}`;
      if (!user.badges.includes(badgeKey)) {
        user.badges.push(badgeKey);
        await user.save();
      }
    }

    res.json({ progress: user.progress[careerId], certificate, totalCompleted: totalTasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user progress for a career
router.get('/progress/:careerId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const progress = user.progress?.[req.params.careerId] || { completedTasks: [], points: 0 };
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get career by ID
router.get('/:careerId', (req, res) => {
  const career = careers[req.params.careerId];
  if (!career) return res.status(404).json({ message: 'Career not found' });
  res.json(career);
});

module.exports = router;
