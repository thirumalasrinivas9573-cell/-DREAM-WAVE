const axios = require('axios');
const { robustAiCall } = require('../services/openaiService');

// Default curated books
const DEFAULT_BOOKS = [
  { title: 'Atomic Habits', author: 'James Clear', category: 'Productivity', rating: 5, cover: '📗', desc: 'Build good habits and break bad ones with science-backed systems.' },
  { title: 'Deep Work', author: 'Cal Newport', category: 'Productivity', rating: 5, cover: '📘', desc: 'Rules for focused success in a distracted world.' },
  { title: 'The Psychology of Money', author: 'Morgan Housel', category: 'Finance', rating: 5, cover: '📙', desc: 'Timeless lessons on wealth, greed, and happiness.' },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Psychology', rating: 4, cover: '📕', desc: 'How two systems of thinking shape our decisions.' },
  { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', category: 'Finance', rating: 4, cover: '📒', desc: 'What the rich teach their kids about money.' },
  { title: 'The Lean Startup', author: 'Eric Ries', category: 'Entrepreneurship', rating: 4, cover: '📔', desc: 'Build, measure, learn -- the startup methodology.' },
  { title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', rating: 5, cover: '📓', desc: 'A brief history of humankind.' },
  { title: 'Zero to One', author: 'Peter Thiel', category: 'Entrepreneurship', rating: 4, cover: '📗', desc: 'Notes on startups and how to build the future.' },
];

// @desc    Get all/search books
// @route   GET /api/books
exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json({ success: true, books: DEFAULT_BOOKS });

    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`,
        { timeout: 8000 }
      );
      const books = (response.data.items || []).map(book => ({
        id: book.id,
        title: book.volumeInfo.title || 'No title',
        author: book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown',
        cover: '📖',
        category: (book.volumeInfo.categories?.[0] || 'General'),
        desc: book.volumeInfo.description ? book.volumeInfo.description.slice(0, 120) + '...' : '',
        rating: Math.round(book.volumeInfo.averageRating || 4),
        thumbnail: book.volumeInfo.imageLinks?.thumbnail || '',
      }));
      return res.json({ success: true, books });
    } catch {
      return res.json({ success: true, books: DEFAULT_BOOKS });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    AI book recommendations
// @route   POST /api/books/recommend
exports.recommendBooks = async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.json({ success: true, books: DEFAULT_BOOKS });

    const messages = [
      { role: 'system', content: 'You are a book recommendation expert. Return ONLY valid JSON.' },
      { role: 'user', content: `Recommend 8 books for someone wanting to: "${goal}". Return: {"books":[{"title":"","author":"","category":"","cover":"📖","desc":"One sentence description","rating":5}]}` }
    ];

    const result = await robustAiCall(messages, 'gpt-3.5-turbo', { books: DEFAULT_BOOKS });
    res.json({ success: true, books: result.books || DEFAULT_BOOKS });
  } catch (error) {
    res.json({ success: true, books: DEFAULT_BOOKS });
  }
};
