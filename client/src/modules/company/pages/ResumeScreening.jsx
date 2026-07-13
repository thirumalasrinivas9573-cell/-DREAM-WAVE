import { useEffect, useState } from 'react'
import { companyApi } from '../../shared/services/api'
import { COMPANY_THEME } from '../theme'

export default function ResumeScreening() {
  const [apps, setApps] = useState([])
  useEffect(() => { companyApi.applications.list({ limit: 30 }).then(r => setApps(r.data.items || [])) }, [])
  return (
    <div>
      <h1 style={{ color: COMPANY_THEME.accentLight }}>🤖 Application Screening</h1>
      <div className="company-glass">
        {apps.map(a => (
          <div key={a._id} style={{ padding: 12, marginBottom: 8, borderRadius: 8, border: '1px solid rgba(168,85,247,0.2)' }}>
            <strong>{a.targetType}</strong> — {a.status}
            <p style={{ fontSize: '0.85rem', opacity: 0.75 }}>{a.coverLetter || 'No cover letter'}</p>
            {a.resumeUrl && <a href={a.resumeUrl} style={{ color: '#C084FC' }}>Resume</a>}
          </div>
        ))}
      </div>
    </div>
  )
}
