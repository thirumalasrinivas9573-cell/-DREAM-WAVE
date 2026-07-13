import PortalCrudPage from '@shared/components/portal/PortalCrudPage'
import { institutionApi } from '@shared/services/api'
import { INSTITUTION_THEME } from '../theme'

const api = {
  list: institutionApi.certificates.list,
  create: institutionApi.certificates.create,
}

const F = [
  { key: 'title', label: 'Certificate Title' },
  { key: 'recipientName', label: 'Recipient' },
  { key: 'issuedAt', label: 'Issue Date', type: 'date' },
]
const C = [{ key: 'title', label: 'Title' }, { key: 'recipientName', label: 'Recipient' }]

export default function Certificates() {
  return <PortalCrudPage title="Certificates" icon="🏅" theme={INSTITUTION_THEME} api={api} fields={F} columns={C} emptyHint="Issue certificates to students" />
}
