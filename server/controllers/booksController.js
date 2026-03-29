const axios = require('axios');

// @desc    Search books
// @route   GET /api/books
exports.searchBooks = async (req, res) => {
  try {
    const { query, category = 'all' } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`
    );

    const books = response.data.items.map(book => ({
      id: book.id,
      title: book.volumeInfo.title || 'No title',
      author: book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown author',
      thumbnail: book.volumeInfo.imageLinks?.thumbnail || '',
      previewLink: book.volumeInfo.previewLink || '',
      description: book.volumeInfo.description || '',
      categories: book.volumeInfo.categories || [],
      publishedDate: book.volumeInfo.publishedDate || '',
      pageCount: book.volumeInfo.pageCount || 0
    }));

    res.json({
      success: true,
      books
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
