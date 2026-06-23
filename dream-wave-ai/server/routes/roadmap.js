const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/roadmapController');

const w = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/generate',                                    auth, w((req, res) => ctrl.generate(req, res)));
router.get('/list',                                         auth, w((req, res) => ctrl.list(req, res)));
router.get('/:id',                                          auth, w((req, res) => ctrl.getOne(req, res)));
router.post('/:id/regenerate',                              auth, w((req, res) => ctrl.regenerate(req, res)));
router.delete('/:id',                                       auth, w((req, res) => ctrl.delete(req, res)));
router.patch('/:id/phase/:phaseIndex/task/:taskIndex',      auth, w((req, res) => ctrl.updatePhaseTask(req, res)));

module.exports = router;
