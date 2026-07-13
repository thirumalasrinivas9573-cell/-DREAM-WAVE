import CategoryCrudPage from '../../shared/components/portal/CategoryCrudPage'
import { institutionApi } from '../../shared/services/api'
import { INSTITUTION_THEME } from '../theme'

const F = [
  { key: 'title', label: 'Title' },
  { key: 'content', label: 'Message', type: 'textarea' },
]
const C = [{ key: 'title', label: 'Title' }, { key: 'status', label: 'Status' }]

export default function Announcements() {
  return <CategoryCrudPage title="Announcements" icon="📣" theme={INSTITUTION_THEME} api={institutionApi.promotions} category="announcement" fields={F} columns={C} emptyHint="Campus announcements" />
}
