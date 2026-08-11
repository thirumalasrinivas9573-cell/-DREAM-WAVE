const express = require('express');
const ctrl = require('../controllers/goalController');
const { protect } = require('../middleware/auth');
const { zodValidate } = require('../middleware/validate');
const schemas = require('../config/schemas');

const router = express.Router();
router.use(protect);
router.get('/', zodValidate({ query: schemas.paginationQuery }), ctrl.list);
router.post('/', zodValidate(schemas.goal), ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', zodValidate(schemas.goalUpdate), ctrl.update);
router.delete('/:id', ctrl.remove);
router.patch('/:id/progress', zodValidate(schemas.goalProgress), ctrl.updateProgress);
router.patch('/:id/milestones/:milestoneId', ctrl.toggleMilestone);

module.exports = router;
