const router = require('express').Router();
const auth = require('../middleware/auth');
const { getBooks } = require('../controllers/booksController');
router.get('/:goal', auth, getBooks);
router.get('/', auth, (req, res) => res.json({ books: [] }));
module.exports = router;
