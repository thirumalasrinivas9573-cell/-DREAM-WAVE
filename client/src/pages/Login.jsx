import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import NeuralBg from '../components/animations/NeuralBg'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Neural network background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <NeuralBg nodeCount={45} color="#8B5CF6" opacity={0.45} />
      </div>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div className="auth-logo">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
            style={{ fontSize: '3rem', marginBottom: 10, display: 'inline-block' }}>🌊</motion.div>
          <h1 className="gradient-text-white" style={{ fontSize: '1.75rem', marginBottom: 6 }}>Dream Wave AI</h1>
          <p style={{ fontSize: '0.875rem' }}>Your AI-powered career intelligence platform</p>
        </div>

        <div className="card" style={{ background: 'rgba(13,13,23,0.9)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <h2 style={{ marginBottom: 22, fontSize: '1.25rem' }}>Welcome back</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="label">Email address</label>
              <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete="current-password" />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 4, width: '100%' }}>
              {loading ? <><div className="spinner" style={{ borderTopColor: 'white' }} /> Signing in…</> : 'Sign In →'}
            </button>
          </form>
          <p style={{ marginTop: 18, textAlign: 'center', fontSize: '0.845rem', color: 'var(--text-muted)' }}>
            New to Dream Wave?{' '}
            <Link to="/signup" style={{ color: 'var(--purple-light)', fontWeight: 600 }}>Create account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
