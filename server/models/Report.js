const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goal: {
    type: String,
    required: true
  },
  report: {
    careerOverview: String,
    demand: String,
    skills: String,
    learningPath: String,
    tools: String,
    salary: String,
    growth: String,
    risks: String,
    opportunities: String,
    caseStudies: String,
    comparison: String,
    finalDecision: String
  },
  pdfUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);
