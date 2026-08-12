import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import NeuralBg from '@shared/components/animations/NeuralBg'

/** Student signup — no email/OTP verification. */
export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup, applySession, goToPortal } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('Password needs 8+ characters with at least one letter and one number.')
      return
    }
    setError(''); setLoading(true)
    try {
      const data = await signup(name, email, password)
      const token = data.token || data.accessToken
      if (token && data.user) {
        applySession(token, data.user, email)
        goToPortal(data.user, '/student/dashboard')
        return
      }
      navigate('/student/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <NeuralBg nodeCount={45} color="#8B5CF6" opacity={0.45} />
      </div>

      <div className="auth-card" style={{ position: 'relative', zIndex: 1 }}>
        <div className="auth-logo">
          <div style={{ fontSize: '3rem', marginBottom: 10 }}>🌊</div>
          <h1 className="gradient-text-white" style={{ fontSize: '1.75rem', marginBottom: 6 }}>Join Dream Wave AI</h1>
          <p style={{ fontSize: '0.875rem' }}>Start your AI-powered career intelligence journey</p>
        </div>

        <div className="card" style={{ background: 'rgba(13,13,23,0.9)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <h2 style={{ marginBottom: 22, fontSize: '1.25rem' }}>Create your account</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="label">Full name</label>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Letter + number, 8+"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </form>

          <p style={{ marginTop: 18, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/student/login" style={{ color: '#C4B5FD' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
