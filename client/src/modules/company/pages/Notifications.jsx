import { useEffect, useState } from 'react'
import { companyApi } from '../../shared/services/api'
import { COMPANY_THEME } from '../theme'

export default function Notifications() {
  const [apps, setApps] = useState([])
  const [promos, setPromos] = useState([])

  useEffect(() => {
    Promise.all([
      companyApi.applications.list({ limit: 5 }),
      companyApi.promotions.list({ limit: 5 }),
    ]).then(([a, p]) => {
      setApps(a.data.items || [])
      setPromos(p.data.items || [])
    })
  }, [])

  const items = [
    ...apps.map(a => ({ id: a._id, text: `New ${a.targetType} application — ${a.status}`, time: a.createdAt })),
    ...promos.map(p => ({ id: p._id, text: `Promotion: ${p.title} (${p.status})`, time: p.createdAt })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time))

  return (
    <div>
      <h1 style={{ color: COMPANY_THEME.accentLight }}>🔔 Notifications</h1>
      {items.length === 0 ? <p style={{ opacity: 0.5 }}>No notifications</p> : items.map(n => (
        <div key={n.id} className="company-glass" style={{ marginBottom: 8, padding: 12 }}>
          <div>{n.text}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{new Date(n.time).toLocaleString()}</div>
        </div>
      ))}
    </div>
  )
}
