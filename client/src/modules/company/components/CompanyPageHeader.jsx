import { COMPANY_THEME } from '../theme'

export default function CompanyPageHeader({ title, subtitle, badge, actions }) {
  const t = COMPANY_THEME
  return (
    <div className="company-glass" style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
      <div>
        {badge && <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: t.accentLight, textTransform: 'uppercase' }}>{badge}</span>}
        <h1 style={{ margin: '4px 0 6px', fontSize: '1.5rem', fontWeight: 800 }}>{title}</h1>
        {subtitle && <p style={{ margin: 0, opacity: 0.6, fontSize: '0.88rem' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  )
}

export function CompanyMetric({ label, value, delta, icon }) {
  const t = COMPANY_THEME
  return (
    <div className="company-glass" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: t.accentLight, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        {icon && <span style={{ fontSize: '1.1rem', opacity: 0.7 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8 }}>{value}</div>
      {delta && <div style={{ fontSize: '0.75rem', marginTop: 4, color: delta.startsWith('+') ? '#34D399' : '#F87171' }}>{delta}</div>}
    </div>
  )
}

export function CompanyMetricGrid({ metrics }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
      {metrics.map(m => <CompanyMetric key={m.label} {...m} />)}
    </div>
  )
}
