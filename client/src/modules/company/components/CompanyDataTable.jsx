import { COMPANY_THEME } from '../theme'

export default function CompanyDataTable({ columns, rows }) {
  const t = COMPANY_THEME
  return (
    <div className="company-glass" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: 'rgba(168,85,247,0.08)' }}>
              {columns.map(col => (
                <th key={col.key} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: t.accentLight, borderBottom: '1px solid rgba(168,85,247,0.15)' }}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                {columns.map(col => (
                  <td key={col.key} style={{ padding: '12px 16px' }}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function PipelineStage({ stage, count, color }) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ height: 4, borderRadius: 999, background: color, marginBottom: 8 }} />
      <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{count}</div>
      <div style={{ fontSize: '0.72rem', opacity: 0.55 }}>{stage}</div>
    </div>
  )
}

export function CorpBadge({ label, variant = 'default' }) {
  const colors = { default: '#A855F7', success: '#34D399', warning: '#FBBF24', danger: '#F87171', info: '#818CF8' }
  const c = colors[variant] || colors.default
  return <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, background: `${c}18`, color: c, border: `1px solid ${c}33` }}>{label}</span>
}
