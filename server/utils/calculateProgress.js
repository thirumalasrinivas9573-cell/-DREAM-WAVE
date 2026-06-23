const Task = require('../models/Task');

/**
 * Calculates completion progress for a goal.
 * @param {string} goalId - The ID of the goal.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<number>} - Progress percentage (0-100).
 */
const calculateProgress = async (goalId, userId) => {
  try {
    const tasks = await Task.find({ goalId, userId });
    const total = tasks.length;
    if (total === 0) return 0;
    
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / total) * 100);
  } catch (err) {
    console.error("[calculateProgress] Error:", err.message);
    return 0;
  }
};

module.exports = calculateProgress;
