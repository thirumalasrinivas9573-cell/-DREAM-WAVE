const Goal = require('../models/Goal');
const OpenAIService = require('../services/openaiService');

// @desc    Create or update goal
// @route   POST /api/goals
exports.createGoal = async (req, res) => {
  try {
    const { goal, age, education, skills } = req.body;

    // Check if user already has an active goal
    const existingGoal = await Goal.findOne({ 
      user: req.user.id, 
      status: 'active' 
    });

    if (existingGoal) {
      existingGoal.status = 'completed';
      await existingGoal.save();
    }

    // Generate AI response
    const aiResponse = await OpenAIService.generateGoalPlan(goal, age, education, skills);

    // Create new goal
    const newGoal = await Goal.create({
      user: req.user.id,
      goal,
      age,
      education,
      skills,
      aiResponse,
      status: 'active'
    });

    // Update user's goals
    req.user.goals.push(newGoal._id);
    await req.user.save();

    res.status(201).json({
      success: true,
      goal: newGoal
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's goals
// @route   GET /api/goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      goals
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single goal
// @route   GET /api/goals/:id
exports.getGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check ownership
    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      goal
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
