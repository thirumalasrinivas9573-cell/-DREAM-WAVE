const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { searchBooks } = require('../controllers/booksController');

router.get('/', auth, searchBooks);

module.exports = router;
