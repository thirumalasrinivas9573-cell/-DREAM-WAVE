const express = require('express')
const auth = require('../middleware/auth')
const controller = require('../controllers/researchController')

const router = express.Router()

const requireStudent = (req, res, next) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ success: false, code: 'STUDENT_ONLY', message: 'Research workspace is available to students only.' })
  }
  return next()
}

router.use(auth, requireStudent, controller.guardEnabled)

router.get('/overview', controller.overview)
router.get('/projects', controller.listProjects)
router.post('/projects', controller.createProject)
router.get('/projects/:id', controller.getProject)
router.put('/projects/:id', controller.updateProject)
router.delete('/projects/:id', controller.deleteProject)

router.post('/projects/:id/sources', controller.addSource)
router.post('/projects/:id/notes', controller.addNote)
router.post('/projects/:id/claims', controller.addClaim)

router.post('/projects/:id/plan/propose', controller.proposePlan)
router.post('/projects/:id/plan/apply', controller.applyPlan)
router.post('/projects/:id/chat', controller.chat)
router.post('/projects/:id/synthesize', controller.synthesize)

module.exports = router
