const router = require('express').Router();
const auth   = require('../middleware/auth');
const { generate, list, getOne } = require('../controllers/roadmapController');

router.post('/generate', auth, generate);
router.get('/list',      auth, list);
router.get('/:id',       auth, getOne);

module.exports = router;
