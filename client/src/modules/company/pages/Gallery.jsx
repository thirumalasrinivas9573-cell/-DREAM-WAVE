import PortalCrudPage from '../../shared/components/portal/PortalCrudPage'
import { companyApi } from '../../shared/services/api'
import { COMPANY_THEME } from '../theme'

const F = [
  { key: 'type', label: 'Type', type: 'select', options: ['image', 'video'], default: 'image' },
  { key: 'url', label: 'URL' },
  { key: 'caption', label: 'Caption' },
]
const C = [{ key: 'type', label: 'Type' }, { key: 'caption', label: 'Caption' }]

export default function Gallery() {
  return <PortalCrudPage title="Gallery" icon="🖼️" theme={COMPANY_THEME} api={companyApi.gallery} fields={F} columns={C} emptyHint="Photos and videos for public page" />
}
