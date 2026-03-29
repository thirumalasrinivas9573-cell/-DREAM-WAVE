const Task = require('../models/Task');
const User = require('../models/User');
const { generateTasks } = require('../services/taskService');

exports.generate = async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ message: 'Goal required' });
    const taskData = await generateTasks(goal);
    const tasks = await Task.insertMany(
      taskData.map(t => ({ ...t, userId: req.user._id }))
    );
    res.json({ tasks });
  } catch (err) {
    console.error('Task gen error:', err.message);
    res.status(500).json({ message: 'Task generation failed' });
  }
};

exports.list = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id })
      .sort({ createdAt: -1 }).limit(20);
    res.json({ tasks });
  } catch (err) { res.status(500).json({ message: 'Error' }); }
};

exports.complete = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.completed) return res.json({ message: 'Already completed', task });
    task.completed = true;
    task.completedAt = new Date();
    await task.save();
    // Update user streak + credits
    const user = await User.findById(req.user._id);
    user.streak = (user.streak || 0) + task.points;
    if (user.streak >= 100) {
      user.credits = (user.credits || 0) + Math.floor(user.streak / 100);
      user.streak = user.streak % 100;
    }
    await user.save();
    res.json({ message: 'Task completed!', points: task.points, streak: user.streak, credits: user.credits });
  } catch (err) { res.status(500).json({ message: 'Error completing task' }); }
};
