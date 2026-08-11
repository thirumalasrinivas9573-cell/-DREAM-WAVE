const express = require('express');
const ctrl = require('../controllers/roadmapController');
const { protect } = require('../middleware/auth');
const { requireVerifiedEmail } = require('../middleware/requireVerifiedEmail');
const { zodValidate } = require('../middleware/validate');
const schemas = require('../config/schemas');

const router = express.Router();
router.use(protect);
router.get('/', ctrl.list);
router.post('/generate', requireVerifiedEmail, zodValidate(schemas.roadmapGenerate), ctrl.generate);
router.post(
  '/generate-adaptive',
  requireVerifiedEmail,
  zodValidate(schemas.roadmapGenerate),
  ctrl.generateAdaptive
);
router.get('/:id', ctrl.getOne);
router.put('/:id', zodValidate(schemas.roadmapUpdate), ctrl.update);
router.delete('/:id', ctrl.remove);
router.patch('/:id/phases/:phaseId', ctrl.togglePhase);
router.patch('/:id/skills/:skillId', zodValidate(schemas.roadmapSkillUpdate), ctrl.updateSkill);
router.post('/:id/adapt', requireVerifiedEmail, ctrl.adapt);
router.get('/:id/milestones', ctrl.milestones);

module.exports = router;
