const express = require('express');
const ctrl = require('../controllers/mentorController');
const { protect } = require('../middleware/auth');
const { requireVerifiedEmail } = require('../middleware/requireVerifiedEmail');
const { uploadFile } = require('../middleware/upload');
const { zodValidate } = require('../middleware/validate');
const schemas = require('../config/schemas');

const router = express.Router();
router.use(protect);
router.get('/', ctrl.list);
router.post('/', zodValidate(schemas.mentorCreate), ctrl.create);
router.get('/:id', ctrl.getOne);
router.patch('/:id', zodValidate(schemas.mentorUpdate), ctrl.rename);
router.get('/:id/export', ctrl.exportChat);
router.post(
  '/:id/messages',
  requireVerifiedEmail,
  uploadFile.array('files', 5),
  zodValidate(schemas.mentorMessage),
  ctrl.sendMessage
);
router.delete('/:id', ctrl.remove);

module.exports = router;
