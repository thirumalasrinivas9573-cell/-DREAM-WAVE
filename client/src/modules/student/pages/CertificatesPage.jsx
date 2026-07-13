import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import StudentLayout from '../layouts/StudentLayout'
import { useAuth } from '@shared/context/AuthContext'
import { profileApi } from '@shared/services/api'
import NeuralBg from '@shared/components/animations/NeuralBg'

export default function CertificatesPage() {
  const { user, updateUser } = useAuth()
  const [certs, setCerts] = useState(user?.certificates || [])
  const [title, setTitle] = useState('Dream Wave Learning Certificate')
  const [type, setType] = useState('completion')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    profileApi.get()
      .then(r => {
        const u = r.data.user || r.data.profile || r.data
        if (u?.certificates) setCerts(u.certificates)
      })
      .catch(() => {})
  }, [])

  const issue = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await profileApi.certificate({ type, title })
      const next = [...certs, data.certificate]
      setCerts(next)
      if (updateUser && user) updateUser({ ...user, certificates: next })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not issue certificate')
    } finally {
      setLoading(false)
    }
  }

  return (
    <StudentLayout>
      <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', marginBottom: 22, minHeight: 160, border: '1px solid rgba(139,92,246,0.25)' }}>
        <NeuralBg nodeCount={20} color="#8B5CF6" opacity={0.25} />
        <div style={{ position: 'relative', zIndex: 1, padding: 24, background: 'linear-gradient(90deg, rgba(5,5,10,0.85), transparent)' }}>
          <h1 style={{ margin: 0 }}>Certificates</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Issue and review credentials linked to your Dream Wave profile.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,360px) 1fr', gap: 16 }}>
        <form className="card" style={{ padding: 18 }} onSubmit={issue}>
          <h3 style={{ marginTop: 0 }}>Issue certificate</h3>
          <div className="form-group">
            <label className="label">Title</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="label">Type</label>
            <select className="select" value={type} onChange={e => setType(e.target.value)}>
              <option value="completion">Completion</option>
              <option value="achievement">Achievement</option>
              <option value="skill">Skill</option>
              <option value="institution">Institution</option>
            </select>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Issuing…' : 'Generate certificate'}</button>
        </form>

        <div>
          <h3 style={{ marginTop: 0 }}>Your certificates ({certs.length})</h3>
          {certs.length === 0 && (
            <div className="card" style={{ padding: 20, color: 'var(--text-muted)' }}>No certificates yet — issue your first one.</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {certs.map((c, i) => (
              <motion.div
                key={`${c.title}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ padding: 16, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{c.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {c.type} · {c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : 'Issued'}
                  </div>
                </div>
                {c.url && (
                  <a href={c.url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                    View
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
