const express = require('express');
const ctrl = require('../controllers/careerController');
const { protect } = require('../middleware/auth');
const { requireVerifiedEmail } = require('../middleware/requireVerifiedEmail');
const { zodValidate } = require('../middleware/validate');
const schemas = require('../config/schemas');

const router = express.Router();
router.use(protect);

router.get('/catalog', ctrl.catalog);
router.get('/profile', ctrl.getProfile);
router.patch('/profile', zodValidate(schemas.careerProfileUpdate), ctrl.updateProfile);

router.get('/skill-gap', ctrl.skillGap);
router.post('/skill-gap', zodValidate(schemas.careerRoleQuery), ctrl.skillGap);

router.get('/recommendations', ctrl.recommendations);
router.get('/salary', ctrl.salaryInsights);

router.get('/roadmaps', ctrl.listIntelligentRoadmaps);
router.post(
  '/roadmaps/generate',
  requireVerifiedEmail,
  zodValidate(schemas.careerRoadmapGenerate),
  ctrl.generateRoadmap
);

router.get('/jobs/match', ctrl.matchJobs);
router.get('/internships/match', ctrl.matchInternships);
router.get('/companies/match', ctrl.matchCompanies);
router.get('/eligibility', ctrl.eligibility);
router.get('/jobs/:jobId/resume-match', ctrl.resumeJobMatch);

router.post(
  '/interview/questions',
  requireVerifiedEmail,
  zodValidate(schemas.careerInterviewQuestions),
  ctrl.generateQuestions
);
router.get('/interview/sessions', ctrl.listInterviewSessions);
router.post(
  '/interview/sessions',
  requireVerifiedEmail,
  zodValidate(schemas.careerInterviewSession),
  ctrl.createInterviewSession
);
router.get('/interview/sessions/:id', ctrl.getInterviewSession);
router.post(
  '/interview/sessions/:id/questions/:questionId/answer',
  requireVerifiedEmail,
  zodValidate(schemas.careerInterviewAnswer),
  ctrl.answerInterviewQuestion
);
router.post(
  '/interview/sessions/:id/complete',
  requireVerifiedEmail,
  ctrl.completeInterviewSession
);

router.post(
  '/resume/analyze',
  requireVerifiedEmail,
  zodValidate(schemas.careerResumeAnalyze),
  ctrl.analyzeResume
);
router.post(
  '/resume/optimize',
  requireVerifiedEmail,
  zodValidate(schemas.careerResumeOptimize),
  ctrl.optimizeResume
);

router.get('/certifications/recommend', ctrl.recommendCertifications);
router.post('/certifications', zodValidate(schemas.careerCertification), ctrl.addCertification);
router.patch(
  '/certifications/:certId',
  zodValidate(schemas.careerCertificationUpdate),
  ctrl.updateCertification
);
router.post(
  '/certifications/:certId/complete',
  zodValidate(schemas.careerCertificationComplete),
  ctrl.completeCertification
);

router.get('/learning/recommendations', ctrl.learningRecommendations);
router.get('/analytics', ctrl.analytics);

module.exports = router;
