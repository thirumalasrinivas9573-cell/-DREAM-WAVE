const router = require('express').Router();
const auth = require('../middleware/auth');
const { generate, list, complete } = require('../controllers/taskController');
router.post('/generate', auth, generate);
router.get('/list', auth, list);
router.put('/complete/:id', auth, complete);
module.exports = router;
