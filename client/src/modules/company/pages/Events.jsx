import PortalCrudPage from '../../shared/components/portal/PortalCrudPage'
import { companyApi } from '../../shared/services/api'
import { COMPANY_THEME } from '../theme'

const F = [
  { key: 'title', label: 'Event Title' },
  { key: 'type', label: 'Type', type: 'select', options: ['event', 'seminar', 'workshop', 'hackathon', 'webinar', 'training', 'other'], default: 'event' },
  { key: 'venue', label: 'Venue' },
  { key: 'startDate', label: 'Start', type: 'date' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published', 'cancelled', 'completed'], default: 'published' },
]
const C = [{ key: 'title', label: 'Title' }, { key: 'type', label: 'Type' }, { key: 'startDate', label: 'Date', render: r => r.startDate ? new Date(r.startDate).toLocaleDateString() : '—' }]

export default function Events() {
  return <PortalCrudPage title="Events" icon="📅" theme={COMPANY_THEME} api={companyApi.events} fields={F} columns={C} emptyHint="Company events and hackathons" />
}
