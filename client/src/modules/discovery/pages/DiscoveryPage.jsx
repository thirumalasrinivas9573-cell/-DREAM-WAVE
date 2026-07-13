import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { discoveryApi } from '../../shared/services/api'

export default function DiscoveryPage() {
  const [feed, setFeed] = useState([])
  const [featured, setFeatured] = useState(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    discoveryApi.featured().then(r => setFeatured(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    discoveryApi.feed({ category: filter || undefined, limit: 30 })
      .then(r => setFeed(r.data.items || []))
      .catch(() => setFeed([]))
  }, [filter])

  return (
    <div style={{ minHeight: '100vh', background: '#0B0F1A', color: '#E2E8F0', padding: '32px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Link to="/" style={{ color: '#94A3B8', fontSize: '0.85rem' }}>← Portals</Link>
        <h1 style={{ margin: '16px 0 8px', fontSize: '2rem' }}>🌊 Dream Wave Discovery</h1>
        <p style={{ opacity: 0.7, marginBottom: 24 }}>News, events, jobs & opportunities from institutions and companies</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {['', 'news', 'event', 'job', 'internship', 'hackathon', 'admission', 'scholarship'].map(c => (
            <button key={c || 'all'} type="button" onClick={() => setFilter(c)}
              style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #334155', background: filter === c ? '#38BDF8' : 'transparent', color: filter === c ? '#0F172A' : '#CBD5E1', cursor: 'pointer' }}>
              {c || 'All'}
            </button>
          ))}
        </div>

        {featured && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Featured Organizations</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {(featured.institutions || []).map(i => (
                <Link key={i._id} to={`/i/${i.slug}`} style={{ padding: 16, borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontWeight: 700 }}>{i.name}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Institution</div>
                </Link>
              ))}
              {(featured.companies || []).map(c => (
                <Link key={c._id} to={`/c/${c.slug}`} style={{ padding: 16, borderRadius: 12, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Company</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gap: 14 }}>
          {feed.length === 0 ? <p style={{ opacity: 0.5 }}>No promotions published yet.</p> : feed.map(p => (
            <Link key={p._id} to={`/discover/${p._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <article style={{ padding: 18, borderRadius: 14, background: 'rgba(15,23,42,0.8)', border: '1px solid #1E293B' }}>
              <div style={{ fontSize: '0.75rem', color: '#38BDF8', marginBottom: 6 }}>{p.category} · {p.ownerName}</div>
              <h3 style={{ margin: '0 0 8px' }}>{p.title}</h3>
              <p style={{ margin: 0, opacity: 0.75, fontSize: '0.9rem', lineHeight: 1.5 }}>{p.content}</p>
              {p.link && <span style={{ color: '#38BDF8', fontSize: '0.85rem' }}>Read more →</span>}
            </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
