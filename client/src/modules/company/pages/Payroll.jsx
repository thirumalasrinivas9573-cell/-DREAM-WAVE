import { useEffect, useState } from 'react'
import { companyApi } from '../../shared/services/api'
import { COMPANY_THEME } from '../theme'

export default function Payroll() {
  const [employees, setEmployees] = useState([])
  useEffect(() => { companyApi.employees.list({ limit: 100 }).then(r => setEmployees(r.data.items || [])) }, [])
  return (
    <div>
      <h1 style={{ color: COMPANY_THEME.accentLight }}>💰 Payroll Summary</h1>
      <div className="company-glass">
        <p>Active employees: {employees.filter(e => e.status === 'active').length}</p>
        <p>On leave: {employees.filter(e => e.status === 'on-leave').length}</p>
        <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>Connect payroll provider in Settings for detailed runs.</p>
      </div>
    </div>
  )
}
