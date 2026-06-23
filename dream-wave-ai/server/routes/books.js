const router = require('express').Router();
const auth   = require('../middleware/auth');
const { getBooks, searchBooks, filterBooks, recommendBooks, googleBooks } = require('../controllers/booksController');

// NEW routes — must be before /:goal to avoid param conflict
router.get('/search',       auth, searchBooks);
router.get('/filter',       auth, filterBooks);
router.get('/google',       auth, googleBooks);
router.post('/recommend',   auth, recommendBooks);

// Existing routes — unchanged
router.get('/:goal',        auth, getBooks);
router.get('/',             auth, (req, res) => res.json({ books: [] }));

module.exports = router;
