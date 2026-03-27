const express = require('express');
// MongoDB removed for demo mode. No model needed.
const auth = require('../middleware/auth');

const router = express.Router();

// Get today's tasks for user
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const tasks = await Task.find({ userId: req.userId, date: today });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all tasks for user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { careerId, title, difficulty, points } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const task = new Task({ userId: req.userId, careerId, title, difficulty, points: points || 10, date: today });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete a task
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.status === 'completed') return res.json({ message: 'Already completed', task });

    task.status = 'completed';
    await task.save();

    // Add points to user
    const user = await User.findById(req.userId);
    user.points = (user.points || 0) + task.points;
    await user.save();

    res.json({ message: 'Task completed', points: task.points, totalPoints: user.points, task });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
