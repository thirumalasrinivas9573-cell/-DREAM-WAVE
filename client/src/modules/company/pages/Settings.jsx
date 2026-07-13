import { useEffect, useState } from 'react'
import { companyApi } from '../../shared/services/api'
import { COMPANY_THEME, companyPath } from '../theme'

export default function Settings() {
  const [company, setCompany] = useState(null)
  const [form, setForm] = useState({ name: '', logo: '', banner: '', contact: { email: '', website: '', linkedin: '' } })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    companyApi.getMine().then(r => {
      setCompany(r.data.company)
      const c = r.data.company
      setForm({ name: c.name, logo: c.logo || '', banner: c.banner || '', contact: { ...c.contact } })
    }).catch(() => companyApi.bootstrap())
  }, [])

  const save = async (e) => {
    e.preventDefault()
    const { data } = await companyApi.updateMine(form)
    setCompany(data.company)
    setMsg('Saved')
  }

  return (
    <div>
      <h1 style={{ color: COMPANY_THEME.accentLight }}>⚙️ Settings</h1>
      {company?.slug && <p style={{ opacity: 0.6 }}>Public: <a href={`/c/${company.slug}`} style={{ color: '#C084FC' }}>/c/{company.slug}</a></p>}
      <form onSubmit={save} className="company-glass" style={{ maxWidth: 520, display: 'grid', gap: 12 }}>
        {['name', 'logo', 'banner'].map(k => (
          <input key={k} className="company-input" placeholder={k} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
        ))}
        <input className="company-input" placeholder="Email" value={form.contact.email} onChange={e => setForm({ ...form, contact: { ...form.contact, email: e.target.value } })} />
        <input className="company-input" placeholder="Website" value={form.contact.website} onChange={e => setForm({ ...form, contact: { ...form.contact, website: e.target.value } })} />
        <input className="company-input" placeholder="LinkedIn" value={form.contact.linkedin} onChange={e => setForm({ ...form, contact: { ...form.contact, linkedin: e.target.value } })} />
        {company && <p style={{ fontSize: '0.82rem' }}>Status: {company.status}</p>}
        {msg && <p style={{ color: '#C084FC' }}>{msg}</p>}
        <button type="submit" className="company-btn company-btn-primary">Save</button>
      </form>
    </div>
  )
}
