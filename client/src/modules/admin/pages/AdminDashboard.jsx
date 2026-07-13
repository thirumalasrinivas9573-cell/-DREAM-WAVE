import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi, libraryApi } from '../../shared/services/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState({ institutions: [], companies: [], promotions: [], reviews: [] })
  const [books, setBooks] = useState([])
  const [reports, setReports] = useState([])
  const [bookForm, setBookForm] = useState({ title: '', author: '', pdfUrl: '', category: 'General' })

  const load = async () => {
    const [ov, inst, comp, prom, rev, bks, reps] = await Promise.all([
      adminApi.overview(),
      adminApi.institutions({ status: 'pending' }),
      adminApi.companies({ status: 'pending' }),
      adminApi.promotions(),
      adminApi.reviews(),
      adminApi.books(),
      adminApi.reports(),
    ])
    setStats(ov.data.stats)
    setPending({
      institutions: inst.data.items || [],
      companies: comp.data.items || [],
      promotions: prom.data.items || [],
      reviews: rev.data.items || [],
    })
    setBooks(bks.data.items || [])
    setReports(reps.data.items || [])
  }

  useEffect(() => { load().catch(() => {}) }, [])

  const addBook = async (e) => {
    e.preventDefault()
    await libraryApi.createBook(bookForm)
    setBookForm({ title: '', author: '', pdfUrl: '', category: 'General' })
    load()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111827', color: '#F3F4F6', padding: '28px 20px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Link to="/" style={{ color: '#9CA3AF' }}>← Home</Link>
        <h1 style={{ marginTop: 16 }}>🛡️ Admin Console</h1>
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, margin: '20px 0' }}>
            {Object.entries(stats).map(([k, v]) => (
              <div key={k} style={{ padding: 14, borderRadius: 10, background: '#1F2937' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{v}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.7 }}>{k}</div>
              </div>
            ))}
          </div>
        )}

        <Panel title="Pending Institutions">
          {pending.institutions.map(i => (
            <Row key={i._id} label={i.name} actions={<>
              <Btn onClick={() => adminApi.approveInstitution(i._id).then(load)}>Approve</Btn>
              <Btn onClick={() => adminApi.suspendInstitution(i._id).then(load)} danger>Suspend</Btn>
            </>} />
          ))}
        </Panel>

        <Panel title="Pending Companies">
          {pending.companies.map(c => (
            <Row key={c._id} label={c.name} actions={<>
              <Btn onClick={() => adminApi.approveCompany(c._id).then(load)}>Approve</Btn>
              <Btn onClick={() => adminApi.suspendCompany(c._id).then(load)} danger>Suspend</Btn>
            </>} />
          ))}
        </Panel>

        <Panel title="Pending Promotions">
          {pending.promotions.map(p => (
            <Row key={p._id} label={p.title} actions={<Btn onClick={() => adminApi.approvePromotion(p._id).then(load)}>Publish</Btn>} />
          ))}
        </Panel>

        <Panel title="Pending Reviews">
          {pending.reviews.map(r => (
            <Row key={r._id} label={`★${r.rating} ${r.content?.slice(0, 40)}`} actions={<>
              <Btn onClick={() => adminApi.moderateReview(r._id, { status: 'approved' }).then(load)}>Approve</Btn>
              <Btn onClick={() => adminApi.moderateReview(r._id, { status: 'rejected' }).then(load)} danger>Reject</Btn>
            </>} />
          ))}
        </Panel>

        <Panel title="Digital Library">
          <form onSubmit={addBook} style={{ display: 'grid', gap: 8, marginBottom: 12, maxWidth: 480 }}>
            <input placeholder="Title" value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} required style={inp} />
            <input placeholder="Author" value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} style={inp} />
            <input placeholder="PDF URL" value={bookForm.pdfUrl} onChange={e => setBookForm({ ...bookForm, pdfUrl: e.target.value })} required style={inp} />
            <button type="submit" style={btnPrimary}>Add Book</button>
          </form>
          {books.map(b => <div key={b._id} style={{ fontSize: '0.85rem', padding: '4px 0' }}>{b.title} — {b.author}</div>)}
        </Panel>

        <Panel title="User Reports">
          {reports.map(r => <div key={r._id} style={{ fontSize: '0.85rem', padding: '6px 0', borderBottom: '1px solid #374151' }}>{r.user?.name || r.user?.email} — {r.type || 'report'}</div>)}
        </Panel>
      </div>
    </div>
  )
}

const inp = { padding: 10, borderRadius: 8, border: '1px solid #374151', background: '#1F2937', color: '#fff' }
const btnPrimary = { padding: '10px 16px', borderRadius: 8, border: 'none', background: '#38BDF8', color: '#0F172A', fontWeight: 700, width: 'fit-content' }

function Panel({ title, children }) {
  return <section style={{ marginBottom: 28, padding: 16, borderRadius: 12, background: '#1F2937' }}><h2 style={{ fontSize: '1rem', marginBottom: 12 }}>{title}</h2>{children}</section>
}
function Row({ label, actions }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 8 }}><span style={{ flex: 1 }}>{label}</span>{actions}</div>
}
function Btn({ children, onClick, danger }) {
  return <button type="button" onClick={onClick} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: danger ? '#DC2626' : '#4B5563', color: '#fff', cursor: 'pointer', fontSize: '0.82rem' }}>{children}</button>
}
