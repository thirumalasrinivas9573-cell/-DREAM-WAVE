import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchApi } from '../../shared/services/api'

export default function SearchPage() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)

  const run = async (e) => {
    e?.preventDefault()
    if (!q.trim()) return
    const { data } = await searchApi.global(q.trim())
    setResults(data.results)
    window.history.replaceState({}, '', `?q=${encodeURIComponent(q.trim())}`)
  }

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q')
    if (initial) { setQ(initial); searchApi.global(initial).then(r => setResults(r.data.results)) }
  }, [])

  const Section = ({ title, items, render }) => {
    if (!items?.length) return null
    return (
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1rem', color: '#38BDF8', marginBottom: 10 }}>{title} ({items.length})</h2>
        <div style={{ display: 'grid', gap: 8 }}>{items.map(render)}</div>
      </section>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B0F1A', color: '#E2E8F0', padding: '28px 20px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Link to="/" style={{ color: '#94A3B8' }}>← Home</Link>
        <h1 style={{ margin: '16px 0' }}>🔍 Global Search</h1>
        <form onSubmit={run} style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Students, institutions, companies, courses, jobs..." style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #334155', background: '#1E293B', color: '#fff' }} />
          <button type="submit" style={{ padding: '12px 20px', borderRadius: 10, border: 'none', background: '#38BDF8', fontWeight: 700, color: '#0F172A' }}>Search</button>
        </form>
        {results && (
          <>
            <Section title="Institutions" items={results.institutions} render={i => <Link key={i._id} to={`/i/${i.slug}`} style={{ color: '#10B981' }}>{i.name}</Link>} />
            <Section title="Companies" items={results.companies} render={c => <Link key={c._id} to={`/c/${c.slug}`} style={{ color: '#A855F7' }}>{c.name}</Link>} />
            <Section title="Courses" items={results.courses} render={c => <div key={c._id}>{c.title}</div>} />
            <Section title="Jobs" items={results.jobs} render={j => <div key={j._id}>{j.title}</div>} />
            <Section title="Internships" items={results.internships} render={j => <div key={j._id}>{j.title}</div>} />
            <Section title="Books" items={results.books} render={b => <Link key={b._id} to={`/library/read/${b._id}`} style={{ color: '#38BDF8' }}>{b.title} — {b.author}</Link>} />
            <Section title="Promotions" items={results.promotions} render={p => <Link key={p._id} to={`/discover/${p._id}`} style={{ color: '#FCD34D' }}>{p.title}</Link>} />
            <Section title="Students" items={results.students} render={s => <div key={s._id}>{s.name}</div>} />
            <Section title="Communities" items={results.communities} render={p => <div key={p._id}>{p.content?.slice(0, 80)}</div>} />
          </>
        )}
      </div>
    </div>
  )
}
