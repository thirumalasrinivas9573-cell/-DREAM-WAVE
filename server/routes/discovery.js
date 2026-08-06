const express = require('express');
const router = express.Router();
const dc = require('../controllers/discoveryController');
const { optionalAuth } = require('../middleware/roleGuard');
const auth = require('../middleware/auth');
const rec = require('../controllers/recommendationController');

router.get('/home', optionalAuth, dc.getHome);
router.get('/feed', dc.getFeed);
router.get('/featured', dc.getFeatured);
router.get('/promotions/:id', dc.getPromotion);
router.get('/recommendations', auth, rec.getRecommendations);

module.exports = router;
