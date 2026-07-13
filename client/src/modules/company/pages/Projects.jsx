import { useEffect, useState } from 'react'
import { companyApi } from '../../shared/services/api'
import { COMPANY_THEME } from '../theme'

export default function Projects() {
  const [promos, setPromos] = useState([])
  useEffect(() => {
    companyApi.promotions.list({ limit: 50 }).then(r => setPromos((r.data.items || []).filter(p => ['product', 'service', 'other'].includes(p.category))))
  }, [])
  return (
    <div>
      <h1 style={{ color: COMPANY_THEME.accentLight }}>📁 Projects & Products</h1>
      <p style={{ opacity: 0.6 }}>Showcase via Promotions (product/service) or Public Profile products</p>
      <div className="company-glass">
        {promos.map(p => <div key={p._id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><strong>{p.title}</strong> — {p.category}</div>)}
      </div>
    </div>
  )
}
