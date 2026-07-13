import { useEffect, useState } from 'react'
import { companyApi } from '@shared/services/api'
import { COMPANY_THEME } from '../theme'

export default function CandidateRanking() {
  const [apps, setApps] = useState([])
  useEffect(() => { companyApi.applications.list({ limit: 50 }).then(r => setApps(r.data.items || [])) }, [])
  const ranked = [...apps].sort((a, b) => (a.status === 'shortlisted' ? -1 : 0))
  return (
    <div>
      <h1 style={{ color: COMPANY_THEME.accentLight }}>⭐ Candidate Ranking</h1>
      <div className="company-glass">
        {ranked.map((a, i) => (
          <div key={a._id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontWeight: 800, color: '#A855F7' }}>#{i + 1}</span>
            <span>{a.targetType} — {a.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
