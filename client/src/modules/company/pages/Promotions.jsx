import PortalCrudPage from '../../shared/components/portal/PortalCrudPage'
import { companyApi } from '../../shared/services/api'
import { COMPANY_THEME } from '../theme'

const F = [
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category', type: 'select', options: ['news', 'job', 'internship', 'training', 'product', 'service', 'announcement', 'hackathon', 'webinar', 'other'], default: 'news' },
  { key: 'content', label: 'Content', type: 'textarea' },
  { key: 'link', label: 'Link' },
]
const C = [{ key: 'title', label: 'Title' }, { key: 'category', label: 'Category' }, { key: 'status', label: 'Status' }]

export default function Promotions() {
  return <PortalCrudPage title="Promotions & News" icon="📢" theme={COMPANY_THEME} api={companyApi.promotions} fields={F} columns={C} emptyHint="Publish to Dream Wave Discovery" />
}
