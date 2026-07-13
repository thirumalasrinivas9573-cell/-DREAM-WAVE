import { useEffect, useState } from 'react'
import { institutionApi } from '../../shared/services/api'
import { INSTITUTION_THEME } from '../theme'

export default function Reports() {
  const t = INSTITUTION_THEME
  const [stats, setStats] = useState(null)

  useEffect(() => {
    institutionApi.dashboard().then(r => setStats(r.data.stats)).catch(() => {})
  }, [])

  return (
    <div>
      <h1 style={{ color: t.accentLight }}>📋 Reports</h1>
      <div className="inst-card">
        <h3 style={{ color: t.accentLight }}>Institution Summary Report</h3>
        {!stats ? <p>Loading...</p> : (
          <ul style={{ lineHeight: 1.8 }}>
            <li>Total Students: {stats.students}</li>
            <li>Total Faculty: {stats.faculty}</li>
            <li>Active Courses: {stats.courses}</li>
            <li>Departments: {stats.departments}</li>
            <li>Placement Records: {stats.placements}</li>
            <li>Pending Admissions: {stats.admissions}</li>
            <li>Published Promotions: {stats.promotions}</li>
          </ul>
        )}
      </div>
    </div>
  )
}
