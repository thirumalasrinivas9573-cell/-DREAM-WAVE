const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goal: { type: String, required: true },
  report: {
    // 15-section deep intelligence report
    executiveSummary:     String,
    industryOverview:     String,
    marketSize:           String,
    futureDemand:         String,
    globalTrends:         String,
    indiaTrends:          String,
    requiredSkills:       String,
    learningRoadmap:      String,
    careerOpportunities:  String,
    salaryAnalysis:       String,
    topCompanies:         String,
    realProjects:         String,
    emergingTechnologies: String,
    challenges:           String,
    recommendations:      String,
    // Legacy fields (backward compat)
    careerOverview:       String,
    demand:               String,
    skills:               String,
    learningPath:         String,
    tools:                String,
    salary:               String,
    growth:               String,
    risks:                String,
    opportunities:        String,
    caseStudies:          String,
    comparison:           String,
    finalDecision:        String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', reportSchema);
