const express = require('express');
const { protect } = require('../middleware/auth');
const { zodValidate } = require('../middleware/validate');
const schemas = require('../config/schemas');
const ctrl = require('../controllers/platformSearchController');

const router = express.Router();
router.use(protect);
router.get('/', zodValidate({ query: schemas.searchQuery }), ctrl.unifiedSearch);

module.exports = router;
