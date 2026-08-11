const express = require('express');
const ctrl = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { requireVerifiedEmail } = require('../middleware/requireVerifiedEmail');
const { zodValidate } = require('../middleware/validate');
const schemas = require('../config/schemas');
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'AI rate limit exceeded. Slow down.', failureClass: 'rate_limit' },
  skip: () => process.env.NODE_ENV === 'test',
});

const router = express.Router();
router.use(protect, aiLimiter);

router.get('/modes', ctrl.listModes);
router.get('/models', ctrl.listModels);
router.get('/credits', ctrl.getCredits);
router.get('/usage', ctrl.getUsage);

router.get('/prompts', ctrl.listPrompts);
router.post('/prompts', zodValidate(schemas.aiPromptCreate), ctrl.createPrompt);
router.put('/prompts/:id', zodValidate(schemas.aiPromptUpdate), ctrl.updatePrompt);
router.delete('/prompts/:id', ctrl.deletePrompt);

router.post('/run', requireVerifiedEmail, zodValidate(schemas.aiRun), ctrl.run);
router.post('/quick', requireVerifiedEmail, zodValidate(schemas.aiQuick), ctrl.quick);
router.post('/stream', requireVerifiedEmail, zodValidate(schemas.aiStream), ctrl.stream);
router.post(
  '/assistants/:name',
  requireVerifiedEmail,
  zodValidate(schemas.aiRun),
  ctrl.assistant
);

module.exports = router;
