import PortalCrudPage from '@shared/components/portal/PortalCrudPage'
import { companyApi } from '@shared/services/api'
import { COMPANY_THEME } from '../theme'

const F = [
  { key: 'name', label: 'Department' },
  { key: 'code', label: 'Code' },
  { key: 'head', label: 'Head' },
  { key: 'description', label: 'Description', type: 'textarea' },
]
const C = [{ key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }, { key: 'head', label: 'Head' }]

export default function Departments() {
  return <PortalCrudPage title="Departments" icon="🏢" theme={COMPANY_THEME} api={companyApi.departments} fields={F} columns={C} emptyHint="Company departments" />
}
