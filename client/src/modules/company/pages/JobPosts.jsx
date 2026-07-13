import PortalCrudPage from '@shared/components/portal/PortalCrudPage'
import { companyApi } from '@shared/services/api'
import { COMPANY_THEME } from '../theme'

const F = [
  { key: 'title', label: 'Job Title' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'location', label: 'Location' },
  { key: 'type', label: 'Type', type: 'select', options: ['full-time', 'part-time', 'contract', 'remote'], default: 'full-time' },
  { key: 'salaryMin', label: 'Salary Min', type: 'number', default: 0 },
  { key: 'salaryMax', label: 'Salary Max', type: 'number', default: 0 },
  { key: 'openings', label: 'Openings', type: 'number', default: 1 },
  { key: 'status', label: 'Status', type: 'select', options: ['draft', 'open', 'closed', 'filled'], default: 'open' },
]
const C = [{ key: 'title', label: 'Title' }, { key: 'location', label: 'Location' }, { key: 'type', label: 'Type' }, { key: 'applicationsCount', label: 'Apps' }, { key: 'status', label: 'Status' }]

export default function JobPosts() {
  return <PortalCrudPage title="Job Openings" icon="💼" theme={COMPANY_THEME} api={companyApi.jobs} fields={F} columns={C} emptyHint="Post jobs to Dream Wave Discovery" />
}
