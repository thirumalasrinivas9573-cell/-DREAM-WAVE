const express = require('express');
const ctrl = require('../controllers/plannerController');
const { protect } = require('../middleware/auth');
const { requireVerifiedEmail } = require('../middleware/requireVerifiedEmail');
const { zodValidate } = require('../middleware/validate');
const schemas = require('../config/schemas');

const router = express.Router();
router.use(protect);
router.get('/overview', ctrl.overview);
router.get('/events', ctrl.list);
router.post('/events', zodValidate(schemas.plannerEvent), ctrl.create);
router.put('/events/:id', zodValidate(schemas.plannerEventUpdate), ctrl.update);
router.delete('/events/:id', ctrl.remove);
router.post('/generate-daily', requireVerifiedEmail, ctrl.generateDaily);

module.exports = router;
