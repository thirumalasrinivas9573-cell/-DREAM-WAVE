import { useState } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import { booksApi } from '../services/api'

const DEFAULT = [
  { title:'Atomic Habits',            author:'James Clear',     category:'Productivity',     rating:5, cover:'📗', desc:'Build good habits, break bad ones with proven science.' },
  { title:'Deep Work',                author:'Cal Newport',     category:'Productivity',     rating:5, cover:'📘', desc:'Rules for focused success in a distracted world.' },
  { title:'The Psychology of Money',  author:'Morgan Housel',   category:'Finance',          rating:5, cover:'📙', desc:'Timeless lessons on wealth, greed, and happiness.' },
  { title:'Thinking, Fast and Slow',  author:'Daniel Kahneman', category:'Psychology',       rating:4, cover:'📕', desc:'How two systems of thinking shape all our decisions.' },
  { title:'Zero to One',              author:'Peter Thiel',     category:'Entrepreneurship', rating:4, cover:'📗', desc:'Notes on startups, and how to build the future.' },
  { title:'The Lean Startup',         author:'Eric Ries',       category:'Entrepreneurship', rating:4, cover:'📔', desc:'Build, Measure, Learn — the startup methodology.' },
  { title:'Sapiens',                  author:'Yuval Noah Harari',category:'History',         rating:5, cover:'📓', desc:'A brief history of humankind — essential reading.' },
  { title:'Rich Dad Poor Dad',        author:'Robert Kiyosaki', category:'Finance',          rating:4, cover:'📒', desc:'What the rich teach their kids about money.' },
  { title:'The Art of Learning',      author:'Josh Waitzkin',   category:'Learning',         rating:5, cover:'📘', desc:'Master the art of deliberate practice and mastery.' },
  { title:'So Good They Can\'t Ignore You', author:'Cal Newport', category:'Career',         rating:5, cover:'📙', desc:'Why skills trump passion in building great careers.' },
  { title:'Mindset',                  author:'Carol S. Dweck',  category:'Psychology',       rating:5, cover:'📕', desc:'The new psychology of success via growth mindset.' },
  { title:'Grit',                     author:'Angela Duckworth',category:'Psychology',       rating:4, cover:'📗', desc:'Passion and perseverance are the secrets to success.' },
]

export default function Books() {
  const [books, setBooks]     = useState(DEFAULT)
  const [query, setQuery]     = useState('')
  const [filter, setFilter]   = useState('All')
  const [loading, setLoading] = useState(false)

  const cats = ['All', ...new Set(books.map(b => b.category))]
  const filtered = filter === 'All' ? books : books.filter(b => b.category === filter)

  const recommend = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const { data } = await booksApi.recommend({ goal: query })
      if (data.books?.length > 0) setBooks(data.books)
    } catch {}
    setLoading(false)
  }

  return (
    <Layout>
      <div className="page-header">
        <h1>📚 <span className="gradient-text">Books</span></h1>
        <p>Curated reading list to accelerate your learning and career journey</p>
      </div>

      <div className="card card-purple" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 10, fontSize: '0.9375rem' }}>🤖 AI Book Recommendations</h3>
        <form onSubmit={recommend} style={{ display: 'flex', gap: 10 }}>
          <input className="input" value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. machine learning, entrepreneurship, web development..." style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <><div className="spinner" style={{ borderTopColor: 'white' }} /> Finding...</> : '🔍 Recommend'}</button>
        </form>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: 18 }}>
        <div className="tab-nav" style={{ width: 'max-content' }}>
          {cats.map(c => <button key={c} className={`tab-item ${filter===c?'active':''}`} onClick={() => setFilter(c)}>{c}</button>)}
        </div>
      </div>

      <div className="grid-4">
        {filtered.map((b, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}>
            <div className="card card-lift" style={{ textAlign: 'center', height: '100%' }}>
              <div style={{ fontSize: '2.8rem', marginBottom: 10 }}>{b.cover || '📖'}</div>
              <h3 style={{ fontSize: '0.9rem', marginBottom: 4, lineHeight: 1.35 }}>{b.title}</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--purple-light)', marginBottom: 8 }}>{b.author}</p>
              {b.desc && <p style={{ fontSize: '0.77rem', marginBottom: 10, lineHeight: 1.55 }}>{b.desc}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>{b.category}</span>
                <span style={{ fontSize: '0.8rem', color: '#F59E0B' }}>{'★'.repeat(b.rating || 4)}{'☆'.repeat(5-(b.rating||4))}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Layout>
  )
}
