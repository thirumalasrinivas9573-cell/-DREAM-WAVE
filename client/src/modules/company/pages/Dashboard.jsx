import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../shared/context/AuthContext'
import { companyApi } from '../../shared/services/api'
import CompanyPageHeader, { CompanyMetricGrid } from '../components/CompanyPageHeader'
import { companyPath } from '../theme'

export default function CompanyDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)

  useEffect(() => {
    companyApi.bootstrap({ name: user?.organizationName }).catch(() => {})
    companyApi.dashboard().then(r => setData(r.data)).catch(() => {})
  }, [user])

  const s = data?.stats || {}

  return (
    <div>
      <CompanyPageHeader badge="Executive Overview" title={`${data?.company?.name || user?.organizationName || 'Enterprise'} Command`} subtitle="Workforce intelligence, hiring pipeline, and operational metrics" />
      {data?.company?.slug && (
        <p style={{ margin: '0 0 16px', fontSize: '0.85rem', opacity: 0.75 }}>
          Public page: <a href={`/c/${data.company.slug}`} style={{ color: '#C084FC' }}>/c/{data.company.slug}</a>
          {' · '}Status: <strong>{data.company.status}</strong>
        </p>
      )}

      <CompanyMetricGrid metrics={[
        { label: 'Employees', value: String(s.employees ?? 0), icon: '◉' },
        { label: 'Open Jobs', value: String(s.jobs ?? 0), icon: '◉' },
        { label: 'Internships', value: String(s.internships ?? 0), icon: '◉' },
        { label: 'Applications', value: String(s.applications ?? 0), icon: '◉' },
        { label: 'Departments', value: String(s.departments ?? 0), icon: '◉' },
        { label: 'Events', value: String(s.events ?? 0), icon: '◉' },
      ]} />

      <div className="company-glass" style={{ marginTop: 18 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '0.9rem', color: '#C084FC' }}>Quick Access</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8 }}>
          {[['Jobs', 'jobs'], ['Internships', 'internships'], ['Employees', 'employees'], ['Applications', 'applications'], ['Analytics', 'analytics'], ['Settings', 'settings']].map(([label, path]) => (
            <Link key={path} to={companyPath(path)} style={{ padding: 12, borderRadius: 10, textDecoration: 'none', color: 'inherit', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)', fontSize: '0.85rem', fontWeight: 600 }}>{label}</Link>
          ))}
        </div>
      </div>
    </div>
  )
}
