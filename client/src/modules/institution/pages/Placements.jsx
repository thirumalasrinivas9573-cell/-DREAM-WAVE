import PortalCrudPage from '../../shared/components/portal/PortalCrudPage'
import { institutionApi } from '../../shared/services/api'
import { INSTITUTION_THEME } from '../theme'

const F = [
  { key: 'company', label: 'Company' },
  { key: 'role', label: 'Role' },
  { key: 'package', label: 'Package (LPA)', type: 'number', default: 0 },
  { key: 'studentsPlaced', label: 'Students Placed', type: 'number', default: 0 },
  { key: 'year', label: 'Year' },
  { key: 'status', label: 'Status', type: 'select', options: ['upcoming', 'ongoing', 'completed'], default: 'completed' },
]
const C = [
  { key: 'company', label: 'Company' },
  { key: 'role', label: 'Role' },
  { key: 'package', label: 'Package', render: r => `₹${r.package}L` },
  { key: 'studentsPlaced', label: 'Placed' },
]

export default function Placements() {
  return <PortalCrudPage title="Placements" icon="💼" theme={INSTITUTION_THEME} api={institutionApi.placements} fields={F} columns={C} emptyHint="Placement drives & outcomes" />
}
