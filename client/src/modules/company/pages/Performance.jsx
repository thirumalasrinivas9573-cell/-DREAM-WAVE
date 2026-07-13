import { useEffect, useState } from 'react'
import { companyApi } from '../../shared/services/api'
import { COMPANY_THEME } from '../theme'

export default function Performance() {
  const [employees, setEmployees] = useState([])
  useEffect(() => { companyApi.employees.list({ limit: 50 }).then(r => setEmployees(r.data.items || [])) }, [])
  return (
    <div>
      <h1 style={{ color: COMPANY_THEME.accentLight }}>📊 Performance Reviews</h1>
      <p style={{ opacity: 0.6 }}>Track employee roles and status from your workforce directory.</p>
      {employees.map(e => (
        <div key={e._id} className="company-glass" style={{ marginBottom: 10, padding: 14 }}>
          <strong>{e.name}</strong> — {e.role || '—'} — {e.status}
        </div>
      ))}
    </div>
  )
}
