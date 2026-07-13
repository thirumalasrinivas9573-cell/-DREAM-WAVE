import PortalCrudPage from '@shared/components/portal/PortalCrudPage'
import { companyApi } from '@shared/services/api'
import { COMPANY_THEME } from '../theme'

const api = {
  list: (p) => companyApi.applications.list(p),
  update: (id, d) => companyApi.applications.update(id, d),
}
const F = [
  { key: 'status', label: 'Status', type: 'select', options: ['pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected'] },
  { key: 'notes', label: 'Notes', type: 'textarea' },
]
const C = [
  { key: 'targetType', label: 'Type' },
  { key: 'status', label: 'Status' },
  { key: 'coverLetter', label: 'Cover', render: r => (r.coverLetter || '—').slice(0, 40) },
  { key: 'createdAt', label: 'Applied', render: r => new Date(r.createdAt).toLocaleDateString() },
]

export default function Applications() {
  return <PortalCrudPage title="Applications" icon="📥" theme={COMPANY_THEME} api={api} fields={F} columns={C} emptyHint="Review candidate applications" allowCreate={false} />
}
