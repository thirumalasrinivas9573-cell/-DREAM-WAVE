import PortalCrudPage from '@shared/components/portal/PortalCrudPage'
import { institutionApi } from '@shared/services/api'
import { INSTITUTION_THEME } from '../theme'

const F = [
  { key: 'applicantName', label: 'Applicant Name' },
  { key: 'applicantEmail', label: 'Email' },
  { key: 'applicantPhone', label: 'Phone' },
  { key: 'status', label: 'Status', type: 'select', options: ['pending', 'reviewing', 'accepted', 'rejected'], default: 'pending' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
]
const C = [{ key: 'applicantName', label: 'Name' }, { key: 'applicantEmail', label: 'Email' }, { key: 'status', label: 'Status' }]

export default function Admissions() {
  return <PortalCrudPage title="Admissions" icon="📝" theme={INSTITUTION_THEME} api={institutionApi.admissions} fields={F} columns={C} emptyHint="Admission applications" />
}
