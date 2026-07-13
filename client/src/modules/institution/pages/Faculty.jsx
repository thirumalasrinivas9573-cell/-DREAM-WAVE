import PortalCrudPage from '@shared/components/portal/PortalCrudPage'
import { institutionApi } from '@shared/services/api'
import { INSTITUTION_THEME } from '../theme'

const F = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'designation', label: 'Designation' },
  { key: 'qualification', label: 'Qualification' },
  { key: 'experience', label: 'Experience (yrs)', type: 'number', default: 0 },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'on-leave', 'inactive'], default: 'active' },
]
const C = [{ key: 'name', label: 'Name' }, { key: 'designation', label: 'Role' }, { key: 'qualification', label: 'Qualification' }, { key: 'status', label: 'Status' }]

export default function Faculty() {
  return <PortalCrudPage title="Faculty" icon="👩‍🏫" theme={INSTITUTION_THEME} api={institutionApi.faculty} fields={F} columns={C} emptyHint="Faculty directory" />
}
