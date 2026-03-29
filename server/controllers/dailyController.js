const OpenAIService = require('../services/openaiService');

// @desc    Get daily advice
// @route   POST /api/daily
exports.getDailyAdvice = async (req, res) => {
  try {
    const { category, query } = req.body;

    const advice = await OpenAIService.generateDailyAdvice(category, query);

    res.json({
      success: true,
      advice
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
