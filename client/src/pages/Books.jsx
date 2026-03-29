import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import { booksAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Search, BookOpen, ExternalLink, Star } from 'lucide-react'

const Books = () => {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: books, isLoading, refetch } = useQuery(
    ['books', searchTerm, category],
    () => booksAPI.searchBooks(searchTerm, category),
    {
      enabled: !!searchTerm,
      refetchOnWindowFocus: false
    }
  )

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) {
      toast.error('Please enter a search term')
      return
    }
    setSearchTerm(query)
  }

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'programming', label: 'Programming' },
    { value: 'business', label: 'Business' },
    { value: 'science', label: 'Science' },
    { value: 'self-help', label: 'Self Help' },
    { value: 'fiction', label: 'Fiction' }
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">Book Library</h1>
        <p className="text-gray-600 text-lg">Discover books that align with your career goals</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="card">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for books, authors, or topics..."
                    className="input-field pl-10"
                  />
                </div>
              </div>
              
              <div className="md:w-48">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn-primary px-8"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-12"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </motion.div>
      )}

      {books?.data?.books && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.data.books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="card group"
              >
                <div className="flex space-x-4">
                  {book.thumbnail ? (
                    <img
                      src={book.thumbnail}
                      alt={book.title}
                      className="w-20 h-28 object-cover rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-28 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-primary-600" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                    
                    {book.categories && book.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {book.categories.slice(0, 2).map((cat, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">4.5</span>
                      </div>
                      
                      {book.previewLink && (
                        <a
                          href={book.previewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 flex items-center space-x-1 text-sm"
                        >
                          <span>Preview</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                
                {book.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                    {book.description}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {searchTerm && books?.data?.books?.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No books found</h3>
          <p className="text-gray-600">Try searching with different keywords</p>
        </motion.div>
      )}

      {!searchTerm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card">
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Start Your Reading Journey</h3>
              <p className="text-gray-600 mb-6">
                Search for books that will help you achieve your career goals
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Career Development</h4>
                  <p className="text-sm text-gray-600">Books on professional growth and skills</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Technical Skills</h4>
                  <p className="text-sm text-gray-600">Programming and technology guides</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Personal Growth</h4>
                  <p className="text-sm text-gray-600">Self-improvement and motivation</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Books
