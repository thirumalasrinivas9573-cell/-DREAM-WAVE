import PortalCrudPage from '../../shared/components/portal/PortalCrudPage'
import { companyApi } from '../../shared/services/api'
import { COMPANY_THEME } from '../theme'

const F = [
  { key: 'title', label: 'Internship Title' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'duration', label: 'Duration' },
  { key: 'stipend', label: 'Stipend', type: 'number', default: 0 },
  { key: 'location', label: 'Location' },
  { key: 'openings', label: 'Openings', type: 'number', default: 1 },
  { key: 'status', label: 'Status', type: 'select', options: ['draft', 'open', 'closed'], default: 'open' },
]
const C = [{ key: 'title', label: 'Title' }, { key: 'duration', label: 'Duration' }, { key: 'stipend', label: 'Stipend' }, { key: 'status', label: 'Status' }]

export default function Internships() {
  return <PortalCrudPage title="Internships" icon="🎓" theme={COMPANY_THEME} api={companyApi.internships} fields={F} columns={C} emptyHint="Internship programs" />
}
