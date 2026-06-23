const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/taskController');

const w = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/generate',              auth, w(ctrl.generate));
router.post('/generate-from-roadmap', auth, w(ctrl.generateFromRoadmap));
router.get('/list',                   auth, w(ctrl.list));
router.get('/progress/:goalId',       auth, w(ctrl.getProgress));
router.put('/complete/:id',           auth, w(ctrl.complete));
router.put('/uncomplete/:id',         auth, w(ctrl.uncomplete));

module.exports = router;
