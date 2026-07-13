import CategoryCrudPage from '../../shared/components/portal/CategoryCrudPage'
import { institutionApi } from '../../shared/services/api'
import { INSTITUTION_THEME } from '../theme'

const F = [
  { key: 'title', label: 'Headline' },
  { key: 'content', label: 'Article', type: 'textarea' },
  { key: 'link', label: 'Link URL' },
]
const C = [{ key: 'title', label: 'Title' }, { key: 'status', label: 'Status' }, { key: 'views', label: 'Views' }]

export default function News() {
  return <CategoryCrudPage title="News" icon="📰" theme={INSTITUTION_THEME} api={institutionApi.promotions} category="news" fields={F} columns={C} emptyHint="Publish news to Dream Wave Discovery" />
}
