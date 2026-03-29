const Task = require('../models/Task');
const User = require('../models/User');
const OpenAIService = require('../services/openaiService');

// @desc    Get user's tasks
// @route   GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { title, description, category, difficulty } = req.body;

    // Generate quiz if category is quiz
    let quiz = null;
    if (category === 'quiz') {
      quiz = await OpenAIService.generateQuiz(title);
    }

    const task = await Task.create({
      user: req.user.id,
      title,
      description,
      category,
      difficulty,
      quiz,
      points: difficulty === 'hard' ? 20 : difficulty === 'medium' ? 15 : 10
    });

    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Complete task
// @route   POST /api/tasks/:id/complete
exports.completeTask = async (req, res) => {
  try {
    const { answer } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (task.completed) {
      return res.status(400).json({ message: 'Task already completed' });
    }

    // Check quiz answer if it's a quiz
    if (task.category === 'quiz' && task.quiz) {
      if (answer !== task.quiz.correctAnswer) {
        return res.status(400).json({ 
          message: 'Incorrect answer',
          correctAnswer: task.quiz.correctAnswer,
          explanation: task.quiz.explanation
        });
      }
    }

    // Mark task as completed
    task.completed = true;
    task.completedAt = new Date();
    await task.save();

    // Update user's streak and credits
    const user = await User.findById(req.user.id);
    user.streak += 1;
    
    // Award credit every 100 streak
    if (user.streak % 100 === 0) {
      user.credits += 1;
      user.level += Math.floor(user.credits / 10);
    }
    
    user.tasks.push(task._id);
    await user.save();

    res.json({
      success: true,
      message: 'Task completed successfully!',
      streak: user.streak,
      credits: user.credits,
      level: user.level,
      points: task.points
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Generate AI task
// @route   POST /api/tasks/generate
exports.generateTask = async (req, res) => {
  try {
    const { topic, category } = req.body;

    const quiz = await OpenAIService.generateQuiz(topic);

    const task = await Task.create({
      user: req.user.id,
      title: `AI Generated: ${topic}`,
      description: `Test your knowledge on ${topic}`,
      category: 'quiz',
      difficulty: 'medium',
      quiz,
      points: 15
    });

    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
