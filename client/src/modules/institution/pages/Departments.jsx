import PortalCrudPage from '@shared/components/portal/PortalCrudPage'
import { institutionApi } from '@shared/services/api'
import { INSTITUTION_THEME } from '../theme'

const F = [
  { key: 'name', label: 'Department Name' },
  { key: 'code', label: 'Code' },
  { key: 'head', label: 'Head' },
  { key: 'description', label: 'Description', type: 'textarea' },
]
const C = [{ key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }, { key: 'head', label: 'Head' }]

export default function Departments() {
  return <PortalCrudPage title="Departments" icon="🏫" theme={INSTITUTION_THEME} api={institutionApi.departments} fields={F} columns={C} emptyHint="Academic departments" />
}
