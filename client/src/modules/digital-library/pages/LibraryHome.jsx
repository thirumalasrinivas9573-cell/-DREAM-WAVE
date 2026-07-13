import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { libraryApi } from '../../shared/services/api'

export default function LibraryHome() {
  const [books, setBooks] = useState([])
  const [continueItems, setContinueItems] = useState([])
  const [q, setQ] = useState('')

  useEffect(() => {
    libraryApi.list({ limit: 40 }).then(r => setBooks(r.data.items || [])).catch(() => {})
    libraryApi.continueReading().then(r => setContinueItems(r.data.items || [])).catch(() => {})
  }, [])

  const search = async (e) => {
    e.preventDefault()
    const { data } = await libraryApi.list({ q, limit: 40 })
    setBooks(data.items || [])
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0C1222', color: '#E2E8F0', padding: '28px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Link to="/" style={{ color: '#94A3B8' }}>← Home</Link>
        <h1 style={{ margin: '12px 0' }}>📚 Digital Library</h1>
        <form onSubmit={search} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search books..." style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #334155', background: '#1E293B', color: '#fff' }} />
          <button type="submit" style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#38BDF8', color: '#0F172A', fontWeight: 700 }}>Search</button>
        </form>
        {continueItems.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <h2>Continue Reading</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
              {continueItems.map(p => (
                <Link key={p._id} to={`/library/read/${p.bookId?._id || p.bookId}`} style={{ padding: 14, borderRadius: 12, background: '#1E293B', textDecoration: 'none', color: 'inherit' }}>
                  {p.bookId?.title || 'Book'} — {Math.round(p.percent || 0)}%
                </Link>
              ))}
            </div>
          </section>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
          {books.map(b => (
            <Link key={b._id} to={`/library/read/${b._id}`} style={{ padding: 16, borderRadius: 14, background: 'rgba(30,41,59,0.9)', border: '1px solid #334155', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontWeight: 700 }}>{b.title}</div>
              <div style={{ fontSize: '0.82rem', opacity: 0.65 }}>{b.author} · {b.category}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
