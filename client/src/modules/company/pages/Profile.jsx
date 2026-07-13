import { useEffect, useState } from 'react'
import { companyApi } from '@shared/services/api'
import { COMPANY_THEME } from '../theme'

export default function Profile() {
  const t = COMPANY_THEME
  const [form, setForm] = useState({
    name: '', about: '', mission: '', vision: '', products: [], services: [], techStack: [],
    contact: { email: '', website: '', linkedin: '' }, isPublic: true,
  })
  const [slug, setSlug] = useState('')
  const [msg, setMsg] = useState('')
  const [productIn, setProductIn] = useState({ name: '', description: '', url: '' })
  const [serviceIn, setServiceIn] = useState({ name: '', description: '' })
  const [techIn, setTechIn] = useState('')

  useEffect(() => {
    companyApi.getMine().then(r => {
      const c = r.data.company
      setSlug(c.slug)
      setForm({
        name: c.name, about: c.about || '', mission: c.mission || '', vision: c.vision || '',
        products: c.products || [], services: c.services || [], techStack: c.techStack || [],
        contact: { ...c.contact }, isPublic: c.isPublic !== false,
      })
    })
  }, [])

  const save = async (e) => {
    e.preventDefault()
    await companyApi.updateMine(form)
    setMsg('Public profile updated')
  }

  return (
    <div>
      <h1 style={{ color: t.accentLight }}>🏢 Public Company Page</h1>
      {slug && <p style={{ opacity: 0.6 }}>URL: <a href={`/c/${slug}`} style={{ color: t.accent }}>/c/{slug}</a></p>}
      <form onSubmit={save} className="company-glass" style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
        {['name'].map(k => <input key={k} className="company-input" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder="Company name" />)}
        {['about', 'mission', 'vision'].map(k => <textarea key={k} className="company-input" rows={2} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={k} />)}
        <div>
          <strong>Add Product</strong>
          <div style={{ display: 'grid', gap: 6, marginTop: 6 }}>
            <input className="company-input" placeholder="Name" value={productIn.name} onChange={e => setProductIn({ ...productIn, name: e.target.value })} />
            <button type="button" className="company-btn" onClick={() => { if (productIn.name) { setForm({ ...form, products: [...form.products, productIn] }); setProductIn({ name: '', description: '', url: '' }) } }}>Add</button>
          </div>
          {form.products.map((p, i) => <div key={i} style={{ fontSize: '0.85rem' }}>{p.name}</div>)}
        </div>
        <div>
          <strong>Tech Stack</strong>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <input className="company-input" value={techIn} onChange={e => setTechIn(e.target.value)} placeholder="e.g. React" />
            <button type="button" className="company-btn" onClick={() => { if (techIn) { setForm({ ...form, techStack: [...form.techStack, techIn] }); setTechIn('') } }}>Add</button>
          </div>
        </div>
        <label><input type="checkbox" checked={form.isPublic} onChange={e => setForm({ ...form, isPublic: e.target.checked })} /> Public profile</label>
        {msg && <p style={{ color: t.accentLight }}>{msg}</p>}
        <button type="submit" className="company-btn company-btn-primary" style={{ width: 'fit-content' }}>Save Profile</button>
      </form>
    </div>
  )
}
