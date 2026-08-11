const express = require('express');
const ctrl = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { zodValidate } = require('../middleware/validate');
const schemas = require('../config/schemas');

const router = express.Router();
router.use(protect);
router.get('/', zodValidate({ query: schemas.paginationQuery }), ctrl.list);
router.post('/', zodValidate(schemas.task), ctrl.create);
router.put('/:id', zodValidate(schemas.taskUpdate), ctrl.update);
router.delete('/:id', ctrl.remove);
router.patch('/:id/toggle', ctrl.toggleComplete);

module.exports = router;
