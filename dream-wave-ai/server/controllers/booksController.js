const OpenAI = require('openai');
const { FALLBACK_BOOKS } = require('../utils/fallbacks');
let _client;
const getClient = () => {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
};

async function fetchBooksFromAI(prompt) {
  const systemPrompt = `You are a knowledgeable mentor recommending books like a trusted friend — not a librarian reading from a catalog.
For each book, write the description like you're personally recommending it: why this specific book, what the student will get from it, and why it matters for their goal.
Keep descriptions short (1-2 sentences), warm, and specific.`;

  const completion = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${prompt}\nReturn ONLY valid JSON (no markdown):\n{"books":[{"title":"","author":"","description":"1-2 sentences — why this book, what the student gets from it","category":"Technical/Mindset/Career/Finance","level":"Beginner/Intermediate/Advanced","subject":"","free":true}]}` }
    ],
    max_tokens: 900, temperature: 0.6,
    response_format: { type: 'json_object' }
  });
  const data = JSON.parse(completion.choices[0].message.content);
  return data.books || [];
}

// ── GET /api/books/:goal ── (existing)
exports.getBooks = async (req, res) => {
  const goal = req.params.goal || req.query.goal || '';
  if (!goal) return res.status(400).json({ message: 'Goal required' });
  try {
    const books = await fetchBooksFromAI(`Recommend 8 books for someone pursuing: ${goal}`);
    res.json({ books, goal });
  } catch (err) {
    console.warn('Books fallback triggered:', err.message);
    res.json({ books: FALLBACK_BOOKS, goal, fallback: true });
  }
};

// ── GET /api/books/search?q= ──
exports.searchBooks = async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ message: 'Query required' });
  try {
    const books = await fetchBooksFromAI(`Find 8 books related to the topic or keyword: "${q}".`);
    res.json({ books, query: q });
  } catch (err) {
    console.warn('Books search fallback:', err.message);
    res.json({ books: FALLBACK_BOOKS, query: q, fallback: true });
  }
};

// ── GET /api/books/filter?subject=&level= ──
exports.filterBooks = async (req, res) => {
  const { subject = '', level = '' } = req.query;
  if (!subject && !level) return res.status(400).json({ message: 'subject or level required' });
  const parts = [];
  if (subject) parts.push(`subject: ${subject}`);
  if (level)   parts.push(`level: ${level}`);
  try {
    const books = await fetchBooksFromAI(`Recommend 8 books for a student with ${parts.join(' and ')}.`);
    res.json({ books, subject, level });
  } catch (err) {
    console.warn('Books filter fallback:', err.message);
    res.json({ books: FALLBACK_BOOKS, subject, level, fallback: true });
  }
};

// ── POST /api/books/recommend ──
exports.recommendBooks = async (req, res) => {
  const { goal } = req.body;
  if (!goal?.trim()) return res.status(400).json({ message: 'Goal required' });
  try {
    const books = await fetchBooksFromAI(`A student says: "${goal}". Suggest the 8 most relevant books.`);
    res.json({ books, goal });
  } catch (err) {
    console.warn('Books recommend fallback:', err.message);
    res.json({ books: FALLBACK_BOOKS, goal, fallback: true });
  }
};

// ── GET /api/books/google?q=keyword ── Google Books API search
exports.googleBooks = async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ message: 'Query required' });

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  // If key is missing or still the placeholder, skip the external call
  const keyValid = apiKey && !apiKey.includes('your-google-books-api-key');
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10${keyValid ? `&key=${apiKey}` : ''}`;

  try {
    // Node 18+ has native fetch; older versions need node-fetch
    const fetchFn = typeof fetch !== 'undefined' ? fetch : (...args) => import('node-fetch').then(m => m.default(...args));
    const response = await fetchFn(url);
    if (!response.ok) throw new Error(`Google Books API error: ${response.status}`);
    const data = await response.json();

    const books = (data.items || []).map(item => {
      const info = item.volumeInfo || {};
      return {
        id:          item.id,
        title:       info.title || 'Unknown Title',
        author:      (info.authors || ['Unknown Author']).join(', '),
        image:       info.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
        description: info.description
          ? info.description.slice(0, 200) + (info.description.length > 200 ? '...' : '')
          : 'No description available.',
        preview:     info.previewLink || null,
        publisher:   info.publisher || '',
        year:        info.publishedDate?.slice(0, 4) || '',
        pages:       info.pageCount || null,
        category:    (info.categories || [])[0] || 'General',
      };
    });

    res.json({ books, query: q, total: data.totalItems || 0 });
  } catch (err) {
    console.warn('Google Books fallback:', err.message);
    res.json({ books: [], query: q, total: 0, error: 'Google Books unavailable' });
  }
};
