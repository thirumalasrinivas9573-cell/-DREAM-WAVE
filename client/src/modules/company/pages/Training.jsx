import { useEffect, useState } from 'react'
import { companyApi } from '@shared/services/api'
import { COMPANY_THEME } from '../theme'

export default function Training() {
  const [events, setEvents] = useState([])
  useEffect(() => {
    companyApi.events.list({ limit: 50 }).then(r => setEvents((r.data.items || []).filter(e => e.type === 'training')))
  }, [])
  return (
    <div>
      <h1 style={{ color: COMPANY_THEME.accentLight }}>🎓 Training Programs</h1>
      <p style={{ opacity: 0.6 }}>Manage training via Events (type: training) or Promotions (category: training)</p>
      <div className="company-glass">
        {events.length === 0 ? <p>No training events yet. Create one in Events with type &quot;training&quot;.</p> : events.map(e => (
          <div key={e._id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{e.title} — {e.venue}</div>
        ))}
      </div>
    </div>
  )
}
