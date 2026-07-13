import PortalCrudPage from '../../shared/components/portal/PortalCrudPage'
import { institutionApi } from '../../shared/services/api'
import { INSTITUTION_THEME } from '../theme'

const F = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'rollNo', label: 'Roll No' },
  { key: 'year', label: 'Year' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'graduated', 'dropped', 'pending'], default: 'active' },
]
const C = [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'rollNo', label: 'Roll' }, { key: 'year', label: 'Year' }, { key: 'status', label: 'Status' }]

export default function Students() {
  return <PortalCrudPage title="Students" icon="👨‍🎓" theme={INSTITUTION_THEME} api={institutionApi.students} fields={F} columns={C} emptyHint="Manage enrolled students" />
}
