import PortalCrudPage from '../../shared/components/portal/PortalCrudPage'
import { institutionApi } from '../../shared/services/api'
import { INSTITUTION_THEME } from '../theme'

const F = [
  { key: 'title', label: 'Course Title' },
  { key: 'code', label: 'Code' },
  { key: 'level', label: 'Level', type: 'select', options: ['UG', 'PG', 'Diploma', 'Certificate', 'Other'], default: 'UG' },
  { key: 'duration', label: 'Duration' },
  { key: 'seats', label: 'Seats', type: 'number', default: 0 },
  { key: 'fees', label: 'Fees', type: 'number', default: 0 },
  { key: 'description', label: 'Description', type: 'textarea' },
]
const C = [{ key: 'title', label: 'Course' }, { key: 'code', label: 'Code' }, { key: 'level', label: 'Level' }, { key: 'seats', label: 'Seats' }, { key: 'enrolled', label: 'Enrolled' }]

export default function Courses() {
  return <PortalCrudPage title="Courses" icon="📚" theme={INSTITUTION_THEME} api={institutionApi.courses} fields={F} columns={C} emptyHint="Programs & courses offered" />
}
