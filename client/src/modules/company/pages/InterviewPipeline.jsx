import { useEffect, useState } from 'react'
import { companyApi } from '@shared/services/api'
import { COMPANY_THEME } from '../theme'

export default function InterviewPipeline() {
  const [apps, setApps] = useState([])
  useEffect(() => {
    companyApi.applications.list({ limit: 50 }).then(r => setApps((r.data.items || []).filter(a => ['reviewing', 'shortlisted', 'interview'].includes(a.status))))
  }, [])
  const stages = ['reviewing', 'shortlisted', 'interview', 'accepted']
  return (
    <div>
      <h1 style={{ color: COMPANY_THEME.accentLight }}>🎤 Interview Pipeline</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
        {stages.map(s => (
          <div key={s} className="company-glass">
            <h3 style={{ color: '#C084FC', textTransform: 'capitalize' }}>{s}</h3>
            {apps.filter(a => a.status === s).map(a => <div key={a._id} style={{ fontSize: '0.85rem', padding: '6px 0' }}>{a.targetType} app</div>)}
          </div>
        ))}
      </div>
    </div>
  )
}
