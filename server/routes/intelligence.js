const express = require('express')
const auth = require('../middleware/auth')
const controller = require('../controllers/intelligenceController')

const router = express.Router()

const requireStudent = (req, res, next) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ success: false, code: 'STUDENT_ONLY', message: 'Student intelligence access only.' })
  }
  return next()
}

router.get('/home', auth, requireStudent, controller.home)
router.get('/insights', auth, requireStudent, controller.insights)
router.get('/recommendations', auth, requireStudent, controller.recommendations)
router.get('/profile', auth, requireStudent, controller.getProfile)
router.put('/profile', auth, requireStudent, controller.updateProfile)
router.get('/memory', auth, requireStudent, controller.memory)
router.get('/learning-dashboard', auth, requireStudent, controller.learningDashboard)
router.get('/next-action', auth, requireStudent, controller.nextAction)
router.get('/decisions', auth, requireStudent, controller.decisionRecommendations)
router.get('/context-summary', auth, requireStudent, controller.contextSummary)
router.get('/graph/summary', auth, requireStudent, controller.graphSummary)
router.post('/recommendations/:fingerprint/dismiss', auth, requireStudent, controller.dismissRecommendation)
router.post('/recommendations/:fingerprint/feedback', auth, requireStudent, controller.feedbackRecommendation)

module.exports = router
