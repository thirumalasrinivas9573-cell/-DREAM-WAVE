import { useEffect, useState } from 'react'
import { companyApi } from '@shared/services/api'
import { COMPANY_THEME } from '../theme'

export default function Analytics() {
  const [data, setData] = useState(null)

  useEffect(() => {
    companyApi.analytics().then(r => setData(r.data.analytics)).catch(() => {})
  }, [])

  if (!data) return <p>Loading analytics...</p>

  return (
    <div>
      <h1 style={{ color: COMPANY_THEME.accentLight }}>📈 Company Analytics</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, margin: '20px 0' }}>
        <Stat label="Visitors" value={data.visitors} />
        <Stat label="Followers" value={data.followers} />
        <Stat label="Hiring Rate" value={`${data.hiringRate || 0}%`} />
        <Stat label="AI Score" value={(data.avgRating || 0).toFixed(1)} />
        <Stat label="Employees" value={data.growth?.employees} />
        <Stat label="Open Jobs" value={data.growth?.jobs} />
      </div>
      <div className="company-glass">
        <h3 style={{ color: '#C084FC' }}>Top Jobs by Applications</h3>
        {(data.topJobs || []).map(j => <div key={j._id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{j.title} — {j.applicationsCount} applications</div>)}
      </div>
      <div className="company-glass" style={{ marginTop: 16 }}>
        <h3 style={{ color: '#C084FC' }}>Applications by Status</h3>
        {(data.applications || []).map(a => <div key={a._id}>{a._id}: {a.count}</div>)}
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return <div className="company-glass" style={{ textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#A855F7' }}>{value ?? 0}</div><div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{label}</div></div>
}
