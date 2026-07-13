import PortalCrudPage from '../../shared/components/portal/PortalCrudPage'
import { institutionApi } from '../../shared/services/api'
import { INSTITUTION_THEME } from '../theme'

const F = [
  { key: 'title', label: 'Event Title' },
  { key: 'type', label: 'Type', type: 'select', options: ['event', 'seminar', 'workshop', 'competition', 'hackathon', 'webinar', 'training', 'other'], default: 'event' },
  { key: 'venue', label: 'Venue' },
  { key: 'startDate', label: 'Start Date', type: 'date' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published', 'cancelled', 'completed'], default: 'published' },
]
const C = [
  { key: 'title', label: 'Title' },
  { key: 'type', label: 'Type' },
  { key: 'startDate', label: 'Date', render: r => r.startDate ? new Date(r.startDate).toLocaleDateString() : '—' },
  { key: 'status', label: 'Status' },
]

export default function Events() {
  return <PortalCrudPage title="Events" icon="📅" theme={INSTITUTION_THEME} api={institutionApi.events} fields={F} columns={C} emptyHint="Campus events & seminars" />
}
