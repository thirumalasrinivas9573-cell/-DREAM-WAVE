import { useEffect, useState } from 'react'
import { companyApi } from '../../shared/services/api'
import { COMPANY_THEME } from '../theme'

export default function HRDashboard() {
  const [stats, setStats] = useState(null)
  const [apps, setApps] = useState([])

  useEffect(() => {
    companyApi.dashboard().then(r => setStats(r.data.stats))
    companyApi.applications.list({ limit: 10 }).then(r => setApps(r.data.items || []))
  }, [])

  return (
    <div>
      <h1 style={{ color: COMPANY_THEME.accentLight }}>👥 HR Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 20 }}>
        <Box label="Employees" value={stats?.employees} />
        <Box label="Applications" value={stats?.applications} />
        <Box label="Open Jobs" value={stats?.jobs} />
        <Box label="Internships" value={stats?.internships} />
      </div>
      <div className="company-glass">
        <h3 style={{ color: '#C084FC' }}>Recent Applications</h3>
        {apps.length === 0 ? <p style={{ opacity: 0.5 }}>No applications yet</p> : apps.map(a => (
          <div key={a._id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{a.targetType} — {a.status}</div>
        ))}
      </div>
    </div>
  )
}

function Box({ label, value }) {
  return <div className="company-glass" style={{ textAlign: 'center' }}><div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{value ?? 0}</div><div style={{ fontSize: '0.78rem', opacity: 0.6 }}>{label}</div></div>
}
