import PortalCrudPage from '@shared/components/portal/PortalCrudPage'
import { institutionApi } from '@shared/services/api'
import { INSTITUTION_THEME } from '../theme'

const F = [
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category', type: 'select', options: ['news', 'event', 'seminar', 'workshop', 'competition', 'hackathon', 'admission', 'scholarship', 'result', 'announcement', 'other'], default: 'news' },
  { key: 'content', label: 'Content', type: 'textarea' },
  { key: 'link', label: 'Link URL' },
]
const C = [
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
  { key: 'views', label: 'Views' },
]

export default function Promotions() {
  return <PortalCrudPage title="News & Promotions" icon="📢" theme={INSTITUTION_THEME} api={institutionApi.promotions} fields={F} columns={C} emptyHint="Published promotions appear in Dream Wave Discovery" />
}
