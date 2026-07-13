import { useEffect, useState } from 'react'
import { institutionApi } from '@shared/services/api'
import { INSTITUTION_THEME } from '../theme'

export default function Profile() {
  const t = INSTITUTION_THEME
  const [form, setForm] = useState({ name: '', about: '', mission: '', vision: '', admissionInfo: '', scholarships: '', brochureUrl: '', isPublic: true })
  const [slug, setSlug] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    institutionApi.getMine().then(r => {
      const i = r.data.institution
      setSlug(i.slug)
      setForm({
        name: i.name || '',
        about: i.about || '',
        mission: i.mission || '',
        vision: i.vision || '',
        admissionInfo: i.admissionInfo || '',
        scholarships: i.scholarships || '',
        brochureUrl: i.brochureUrl || '',
        isPublic: i.isPublic !== false,
      })
    }).catch(() => institutionApi.bootstrap())
  }, [])

  const save = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      await institutionApi.updateMine(form)
      setMsg('Public profile updated')
    } catch (err) {
      setMsg(err.response?.data?.message || 'Save failed')
    }
  }

  return (
    <div>
      <h1 style={{ color: t.accentLight }}>🏛️ Public Institution Profile</h1>
      {slug && <p style={{ opacity: 0.6 }}>Public URL: <a href={`/i/${slug}`} style={{ color: t.accent }}>/i/{slug}</a></p>}
      <form onSubmit={save} className="inst-card" style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
        {['name', 'brochureUrl'].map(k => (
          <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.8rem' }}>
            {k === 'brochureUrl' ? 'Brochure URL' : 'Institution Name'}
            <input className="inst-input" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
          </label>
        ))}
        {['about', 'mission', 'vision', 'admissionInfo', 'scholarships'].map(k => (
          <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.8rem' }}>
            {k.charAt(0).toUpperCase() + k.slice(1)}
            <textarea className="inst-input" rows={3} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
          </label>
        ))}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={form.isPublic} onChange={e => setForm({ ...form, isPublic: e.target.checked })} /> Public profile visible
        </label>
        {msg && <p style={{ color: t.accentLight }}>{msg}</p>}
        <button type="submit" className="inst-btn inst-btn-primary" style={{ width: 'fit-content' }}>Save Profile</button>
      </form>
    </div>
  )
}
