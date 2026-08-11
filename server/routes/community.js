const express = require('express');
const ctrl = require('../controllers/communityController');
const { protect } = require('../middleware/auth');
const { zodValidate } = require('../middleware/validate');
const { uploadImage } = require('../middleware/upload');
const schemas = require('../config/schemas');

const router = express.Router();
router.use(protect);
router.get('/', ctrl.list);
router.post('/', uploadImage.single('image'), zodValidate(schemas.communityPost), ctrl.create);
router.post('/:id/like', ctrl.like);
router.post('/:id/comments', zodValidate(schemas.comment), ctrl.comment);
router.delete('/:id', ctrl.remove);

module.exports = router;
