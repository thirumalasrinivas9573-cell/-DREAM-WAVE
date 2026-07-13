import { useEffect, useState } from 'react'
import { companyApi } from '../../shared/services/api'
import { COMPANY_THEME } from '../theme'

export default function Attendance() {
  const [employees, setEmployees] = useState([])
  useEffect(() => { companyApi.employees.list({ limit: 100 }).then(r => setEmployees(r.data.items || [])) }, [])
  const active = employees.filter(e => e.status === 'active').length
  return (
    <div>
      <h1 style={{ color: COMPANY_THEME.accentLight }}>✅ Attendance Overview</h1>
      <div className="company-glass" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#A855F7' }}>{employees.length ? Math.round((active / employees.length) * 100) : 0}%</div>
        <div>Active today ({active}/{employees.length})</div>
      </div>
      {employees.map(e => (
        <div key={e._id} className="company-glass" style={{ marginBottom: 8, padding: 12 }}>{e.name} — {e.status}</div>
      ))}
    </div>
  )
}
