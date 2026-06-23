const mongoose = require('mongoose');

// Rich roadmap schema that stores the full AI-generated specialist report
const roadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true,
    index: true,
  },
  // The full rich AI roadmap object (currentStage, overview, nextSteps, skills,
  // courses, colleges, exams, timeline, milestones, salaryProgression, tips,
  // careerPaths, certifications)
  data: {
    type: Object,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
