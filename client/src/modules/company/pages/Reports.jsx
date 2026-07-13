import { useEffect, useState } from 'react'
import { companyApi } from '../../shared/services/api'
import { COMPANY_THEME } from '../theme'

export default function Reports() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    companyApi.dashboard().then(r => setStats(r.data.stats)).catch(() => {})
  }, [])

  return (
    <div>
      <h1 style={{ color: COMPANY_THEME.accentLight }}>📋 Reports</h1>
      <div className="company-glass">
        {!stats ? <p>Loading...</p> : (
          <ul style={{ lineHeight: 1.9 }}>
            <li>Employees: {stats.employees}</li>
            <li>Open Jobs: {stats.jobs}</li>
            <li>Internships: {stats.internships}</li>
            <li>Total Applications: {stats.applications}</li>
            <li>Departments: {stats.departments}</li>
            <li>Events: {stats.events}</li>
          </ul>
        )}
      </div>
    </div>
  )
}
