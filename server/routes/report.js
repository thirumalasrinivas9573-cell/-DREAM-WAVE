const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  generateReport,
  getReports,
  downloadPDF,
} = require('../controllers/reportController');

router.post('/', auth, generateReport);
router.get('/', auth, getReports);
router.get('/:id/download', auth, downloadPDF);

module.exports = router;
