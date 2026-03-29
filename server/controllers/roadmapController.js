const OpenAIService = require('../services/openaiService');

// @desc    Generate roadmap
// @route   POST /api/roadmap
exports.generateRoadmap = async (req, res) => {
  try {
    const { goal, currentLevel } = req.body;

    const roadmap = await OpenAIService.generateRoadmap(goal, currentLevel);

    res.json({
      success: true,
      roadmap
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
