import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { libraryApi } from '@shared/services/api'

export default function PdfReader() {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [progress, setProgress] = useState(null)
  const [summary, setSummary] = useState('')
  const [page, setPage] = useState(1)
  const [note, setNote] = useState('')
  const [tab, setTab] = useState('read')

  useEffect(() => {
    libraryApi.get(id).then(r => setBook(r.data.book)).catch(() => {})
    libraryApi.progress(id).then(r => {
      setProgress(r.data.progress)
      setPage(r.data.progress?.currentPage || 1)
    }).catch(() => {})
  }, [id])

  const save = async (nextPage, extra = {}) => {
    const total = book?.pages || 100
    const percent = Math.min(100, Math.round((nextPage / total) * 100))
    const { data } = await libraryApi.saveProgress(id, {
      currentPage: nextPage,
      percent,
      bookmarks: extra.bookmarks ?? progress?.bookmarks,
      highlights: extra.highlights ?? progress?.highlights,
      notes: extra.notes ?? progress?.notes,
      lastReadAt: new Date().toISOString(),
    })
    setProgress(data.progress)
  }

  const addBookmark = async () => {
    const bookmarks = [...(progress?.bookmarks || []), { page, label: `Page ${page}`, createdAt: new Date() }]
    await save(page, { bookmarks })
  }

  const addNote = async () => {
    if (!note.trim()) return
    const notes = [...(progress?.notes || []), { page, content: note, createdAt: new Date() }]
    setNote('')
    await save(page, { notes })
  }

  const loadSummary = async () => {
    const { data } = await libraryApi.summary(id)
    setSummary(data.summary)
    setTab('summary')
  }

  if (!book) return <p style={{ padding: 40, color: '#94A3B8' }}>Loading...</p>

  return (
    <div style={{ minHeight: '100vh', background: '#0C1222', color: '#E2E8F0' }}>
      <header style={{ padding: '12px 16px', borderBottom: '1px solid #334155', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <Link to="/library" style={{ color: '#94A3B8' }}>← Library</Link>
        <strong style={{ flex: 1 }}>{book.title}</strong>
        <span style={{ opacity: 0.6, fontSize: '0.85rem' }}>p.{page}{book.pages ? `/${book.pages}` : ''} · {Math.round(progress?.percent || 0)}%</span>
        <button type="button" onClick={() => { const n = Math.max(1, page - 1); setPage(n); save(n) }}>Prev</button>
        <button type="button" onClick={() => { const n = page + 1; setPage(n); save(n) }}>Next</button>
        <button type="button" onClick={addBookmark}>Bookmark</button>
        <button type="button" onClick={loadSummary}>AI Summary</button>
        <button type="button" onClick={() => setTab(tab === 'notes' ? 'read' : 'notes')}>Notes</button>
      </header>

      {tab === 'summary' && summary && (
        <div style={{ padding: 16, background: '#1E293B', margin: 16, borderRadius: 12, lineHeight: 1.6 }}>{summary}</div>
      )}

      {tab === 'notes' && (
        <div style={{ padding: 16, maxWidth: 400 }}>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Note for this page..." style={{ width: '100%', padding: 10, borderRadius: 8, background: '#1E293B', border: '1px solid #334155', color: '#fff' }} />
          <button type="button" onClick={addNote} style={{ marginTop: 8, padding: '8px 14px', borderRadius: 8, border: 'none', background: '#38BDF8', fontWeight: 700 }}>Save Note</button>
          {(progress?.notes || []).map((n, i) => <div key={i} style={{ marginTop: 8, fontSize: '0.85rem' }}>p.{n.page}: {n.content}</div>)}
          {(progress?.bookmarks || []).map((b, i) => <div key={i} style={{ marginTop: 4, fontSize: '0.82rem', opacity: 0.7 }}>🔖 {b.label}</div>)}
        </div>
      )}

      <iframe title={book.title} src={libraryApi.pdfUrl(id)} style={{ width: '100%', height: tab === 'read' ? 'calc(100vh - 56px)' : '60vh', border: 'none', background: '#fff' }} />
    </div>
  )
}
