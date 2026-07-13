import { useEffect, useState } from 'react'
import { companyApi } from '@shared/services/api'
import { COMPANY_THEME } from '../theme'

export default function Recruitment() {
  const [jobs, setJobs] = useState([])
  const [internships, setInternships] = useState([])

  useEffect(() => {
    companyApi.jobs.list({ limit: 20 }).then(r => setJobs(r.data.items || []))
    companyApi.internships.list({ limit: 20 }).then(r => setInternships(r.data.items || []))
  }, [])

  return (
    <div>
      <h1 style={{ color: COMPANY_THEME.accentLight }}>🎯 Hiring Pipeline</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
        <div className="company-glass">
          <h3 style={{ color: '#C084FC' }}>Open Jobs ({jobs.length})</h3>
          {jobs.map(j => <div key={j._id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{j.title} — {j.applicationsCount} apps</div>)}
        </div>
        <div className="company-glass">
          <h3 style={{ color: '#C084FC' }}>Internships ({internships.length})</h3>
          {internships.map(j => <div key={j._id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{j.title} — {j.applicationsCount || 0} apps</div>)}
        </div>
      </div>
    </div>
  )
}
