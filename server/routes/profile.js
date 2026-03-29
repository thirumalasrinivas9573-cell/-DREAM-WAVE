const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const {
  updateProfile,
  uploadProfileImage,
  getProfile,
  generateCertificate,
} = require('../controllers/profileController');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', auth, getProfile);
router.put('/', auth, updateProfile);
router.post('/upload', auth, upload.single('image'), uploadProfileImage);
router.post('/certificate', auth, generateCertificate);

module.exports = router;
