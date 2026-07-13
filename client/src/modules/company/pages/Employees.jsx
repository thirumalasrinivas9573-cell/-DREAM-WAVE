import PortalCrudPage from '@shared/components/portal/PortalCrudPage'
import { companyApi } from '@shared/services/api'
import { COMPANY_THEME } from '../theme'

const F = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'on-leave', 'terminated'], default: 'active' },
]
const C = [{ key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'status', label: 'Status' }]

export default function Employees() {
  return <PortalCrudPage title="Employees" icon="👥" theme={COMPANY_THEME} api={companyApi.employees} fields={F} columns={C} emptyHint="Workforce directory" />
}
