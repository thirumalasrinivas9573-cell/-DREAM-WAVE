import { useEffect, useState } from 'react'
import { institutionApi } from '@shared/services/api'
import { INSTITUTION_THEME } from '../theme'

export default function Analytics() {
  const t = INSTITUTION_THEME
  const [data, setData] = useState(null)

  useEffect(() => {
    institutionApi.analytics().then(r => setData(r.data.analytics)).catch(() => {})
  }, [])

  if (!data) return <p>Loading analytics...</p>

  return (
    <div>
      <h1 style={{ color: t.accentLight }}>📈 Analytics</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, margin: '20px 0' }}>
        <div className="inst-card"><div style={{ fontSize: '1.4rem', fontWeight: 800, color: t.accent }}>{data.visitors || 0}</div><div>Visitors</div></div>
        <div className="inst-card"><div style={{ fontSize: '1.4rem', fontWeight: 800, color: t.accent }}>{data.followers || 0}</div><div>Followers</div></div>
        <div className="inst-card"><div style={{ fontSize: '1.4rem', fontWeight: 800, color: t.accent }}>{(data.avgRating || 0).toFixed(1)}</div><div>AI Rating</div></div>
        <div className="inst-card"><div style={{ fontSize: '1.4rem', fontWeight: 800, color: t.accent }}>{data.growth?.placementRate || 0}%</div><div>Placement Rate</div></div>
      </div>
      <div className="inst-card" style={{ marginBottom: 16 }}>
        <h3 style={{ color: t.accentLight }}>Popular Courses</h3>
        {(data.popularCourses || []).map(c => (
          <div key={c._id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{c.title} — {c.enrolled} enrolled</div>
        ))}
      </div>
      <div className="inst-card">
        <h3 style={{ color: t.accentLight }}>Placement Highlights</h3>
        {(data.placements || []).map(p => (
          <div key={p._id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{p.company} — {p.role} — ₹{p.package}L</div>
        ))}
      </div>
    </div>
  )
}
