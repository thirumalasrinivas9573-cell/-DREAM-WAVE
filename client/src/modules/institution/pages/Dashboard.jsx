import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import { institutionApi } from '@shared/services/api'
import { INSTITUTION_THEME, institutionPath } from '../theme'

export default function InstitutionDashboard() {
  const { user } = useAuth()
  const t = INSTITUTION_THEME
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    institutionApi.bootstrap({ name: user?.organizationName }).catch(() => {})
    institutionApi.dashboard()
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [user])

  const s = data?.stats || {}

  return (
    <div>
          <h1 style={{ margin: '0 0 8px', color: t.accentLight }}>🏛️ {data?.institution?.name || user?.organizationName || 'Institution'} Overview</h1>
      <p style={{ margin: '0 0 12px', opacity: 0.6 }}>Real-time campus operations & analytics</p>
      {data?.institution?.slug && (
        <p style={{ margin: '0 0 24px', fontSize: '0.85rem' }}>
          Public page: <a href={`/i/${data.institution.slug}`} style={{ color: t.accent }}>/i/{data.institution.slug}</a>
          {' · '}Status: <strong style={{ color: data.institution.status === 'approved' ? '#34D399' : t.accent }}>{data.institution.status}</strong>
        </p>
      )}

      {loading ? <p>Loading dashboard...</p> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Students', value: s.students ?? 0, to: 'students' },
              { label: 'Faculty', value: s.faculty ?? 0, to: 'faculty' },
              { label: 'Courses', value: s.courses ?? 0, to: 'courses' },
              { label: 'Departments', value: s.departments ?? 0, to: 'departments' },
              { label: 'Pending Admissions', value: s.admissions ?? 0, to: 'admissions' },
              { label: 'Placements', value: s.placements ?? 0, to: 'placements' },
            ].map(card => (
              <Link key={card.label} to={institutionPath(card.to)} className="inst-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: t.accent }}>{card.value}</div>
                <div style={{ fontSize: '0.82rem', opacity: 0.7 }}>{card.label}</div>
              </Link>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div className="inst-card">
              <h3 style={{ margin: '0 0 12px', color: t.accentLight }}>Recent Admissions</h3>
              {(data?.recentAdmissions || []).length === 0 ? <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>No applications yet</p> : data.recentAdmissions.map(a => (
                <div key={a._id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                  <strong>{a.applicantName}</strong> — {a.applicantEmail} — {a.status}
                </div>
              ))}
            </div>
            <div className="inst-card">
              <h3 style={{ margin: '0 0 12px', color: t.accentLight }}>Upcoming Events</h3>
              {(data?.recentEvents || []).length === 0 ? <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>No events scheduled</p> : data.recentEvents.map(ev => (
                <div key={ev._id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                  {ev.title} — {ev.startDate ? new Date(ev.startDate).toLocaleDateString() : 'TBD'}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
