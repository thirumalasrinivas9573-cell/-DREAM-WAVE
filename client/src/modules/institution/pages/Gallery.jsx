import PortalCrudPage from '@shared/components/portal/PortalCrudPage'
import { institutionApi } from '@shared/services/api'
import { INSTITUTION_THEME } from '../theme'

const F = [
  { key: 'type', label: 'Type', type: 'select', options: ['image', 'video'], default: 'image' },
  { key: 'url', label: 'Media URL' },
  { key: 'caption', label: 'Caption' },
  { key: 'order', label: 'Order', type: 'number', default: 0 },
]
const C = [
  { key: 'type', label: 'Type' },
  { key: 'caption', label: 'Caption' },
  { key: 'url', label: 'URL', render: r => <a href={r.url} target="_blank" rel="noreferrer" style={{ color: '#FCD34D' }}>View</a> },
]

export default function Gallery() {
  return <PortalCrudPage title="Gallery & Videos" icon="🖼️" theme={INSTITUTION_THEME} api={institutionApi.gallery} fields={F} columns={C} emptyHint="Campus images and videos for your public profile" />
}
