import { useEffect, useState } from 'react'
import { institutionApi } from '@shared/services/api'
import { INSTITUTION_THEME } from '../theme'

export default function Settings() {
  const t = INSTITUTION_THEME
  const [inst, setInst] = useState(null)
  const [form, setForm] = useState({ name: '', contact: { email: '', phone: '', website: '' }, logo: '', banner: '' })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    institutionApi.getMine().then(r => {
      setInst(r.data.institution)
      const i = r.data.institution
      setForm({ name: i.name, contact: { ...i.contact }, logo: i.logo || '', banner: i.banner || '' })
    }).catch(() => institutionApi.bootstrap())
  }, [])

  const save = async (e) => {
    e.preventDefault()
    try {
      const { data } = await institutionApi.updateMine(form)
      setInst(data.institution)
      setMsg('Settings saved')
    } catch (err) { setMsg(err.response?.data?.message || 'Save failed') }
  }

  return (
    <div>
      <h1 style={{ color: t.accentLight }}>⚙️ Institution Settings</h1>
      <form onSubmit={save} className="inst-card" style={{ maxWidth: 520, display: 'grid', gap: 12 }}>
        <label style={{ fontSize: '0.8rem' }}>Institution Name<input className="inst-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
        <label style={{ fontSize: '0.8rem' }}>Logo URL<input className="inst-input" value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })} /></label>
        <label style={{ fontSize: '0.8rem' }}>Banner URL<input className="inst-input" value={form.banner} onChange={e => setForm({ ...form, banner: e.target.value })} /></label>
        <label style={{ fontSize: '0.8rem' }}>Contact Email<input className="inst-input" value={form.contact.email} onChange={e => setForm({ ...form, contact: { ...form.contact, email: e.target.value } })} /></label>
        <label style={{ fontSize: '0.8rem' }}>Phone<input className="inst-input" value={form.contact.phone} onChange={e => setForm({ ...form, contact: { ...form.contact, phone: e.target.value } })} /></label>
        <label style={{ fontSize: '0.8rem' }}>Website<input className="inst-input" value={form.contact.website} onChange={e => setForm({ ...form, contact: { ...form.contact, website: e.target.value } })} /></label>
        {inst && <p style={{ fontSize: '0.82rem', opacity: 0.6 }}>Status: <strong>{inst.status}</strong></p>}
        {msg && <p style={{ color: t.accentLight }}>{msg}</p>}
        <button type="submit" className="inst-btn inst-btn-primary" style={{ width: 'fit-content' }}>Save</button>
      </form>
    </div>
  )
}
