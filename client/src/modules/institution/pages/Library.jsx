import { useEffect, useState } from 'react'
import { institutionApi, libraryApi } from '../../shared/services/api'
import { INSTITUTION_THEME } from '../theme'

export default function Library() {
  const t = INSTITUTION_THEME
  const [books, setBooks] = useState([])
  const [form, setForm] = useState({ title: '', author: '', category: 'General', description: '', pdfUrl: '', pages: 0 })
  const [msg, setMsg] = useState('')

  const load = () => libraryApi.list({ limit: 50 }).then(r => setBooks(r.data.items || []))
  useEffect(() => { load() }, [])

  const addBook = async (e) => {
    e.preventDefault()
    try {
      await libraryApi.createBook(form)
      setMsg('Book added to digital library')
      setForm({ title: '', author: '', category: 'General', description: '', pdfUrl: '', pages: 0 })
      load()
    } catch (err) { setMsg(err.response?.data?.message || 'Failed') }
  }

  return (
    <div>
      <h1 style={{ color: t.accentLight }}>📖 Digital Library Management</h1>
      <p style={{ opacity: 0.7 }}>Add PDF books for students. <a href="/library" style={{ color: t.accent }}>Open student library →</a></p>
      <form onSubmit={addBook} className="inst-card" style={{ display: 'grid', gap: 10, maxWidth: 560, marginBottom: 24 }}>
        <input className="inst-input" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <input className="inst-input" placeholder="Author" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
        <input className="inst-input" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
        <input className="inst-input" placeholder="PDF URL" value={form.pdfUrl} onChange={e => setForm({ ...form, pdfUrl: e.target.value })} required />
        <textarea className="inst-input" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
        <button type="submit" className="inst-btn inst-btn-primary" style={{ width: 'fit-content' }}>Add Book</button>
        {msg && <span style={{ color: t.accentLight }}>{msg}</span>}
      </form>
      <div className="inst-card">
        <h3 style={{ color: t.accentLight }}>Catalog ({books.length})</h3>
        {books.map(b => <div key={b._id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{b.title} — {b.author} — {b.category}</div>)}
      </div>
    </div>
  )
}
