const OpenAIService = require('../services/openaiService');

// @desc    Get mentor advice
// @route   POST /api/mentor
exports.getMentorAdvice = async (req, res) => {
  try {
    const { query } = req.body;

    const advice = await OpenAIService.generateMentorAdvice(query);

    res.json({
      success: true,
      advice
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
