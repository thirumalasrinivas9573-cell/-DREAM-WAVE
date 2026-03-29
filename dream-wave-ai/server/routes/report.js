const router = require('express').Router();
const auth   = require('../middleware/auth');
const { generate, download, list } = require('../controllers/reportController');

router.post('/generate',          auth, generate);
router.get('/download/:filename',       download);  // no auth — link is unguessable
router.get('/list',               auth, list);

module.exports = router;
