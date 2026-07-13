import PortalCrudPage from '@shared/components/portal/PortalCrudPage'
import { companyApi } from '@shared/services/api'
import { COMPANY_THEME } from '../theme'

const api = { list: companyApi.certificates.list, create: companyApi.certificates.create }
const F = [
  { key: 'title', label: 'Certificate' },
  { key: 'recipientName', label: 'Recipient' },
  { key: 'recipientEmail', label: 'Email' },
]
const C = [{ key: 'title', label: 'Title' }, { key: 'recipientName', label: 'Recipient' }]

export default function Certificates() {
  return <PortalCrudPage title="Certificates" icon="🏅" theme={COMPANY_THEME} api={api} fields={F} columns={C} emptyHint="Issue training certificates" />
}
