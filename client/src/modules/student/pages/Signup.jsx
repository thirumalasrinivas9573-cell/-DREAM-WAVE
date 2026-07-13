import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@shared/context/AuthContext'
import { authApi } from '@shared/services/api'
import NeuralBg from '@shared/components/animations/NeuralBg'
import OtpInput from '@shared/components/auth/OtpInput'

/**
 * Student Portal signup — original NeuralBg + auth-card UI.
 * Email OTP via shared production auth (no JWT until verified).
 */
export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('form')
  const [otp, setOtp] = useState('')
  const { signup, applySession } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setError(''); setLoading(true)
    try {
      const data = await signup(name, email, password)
      if (data.requiresVerification) {
        setInfo('Enter the verification code sent to your email.')
        setStep('otp')
        return
      }
      navigate('/student/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (otp.length < 6) return setError('Enter the 6-digit code')
    setError(''); setLoading(true)
    try {
      const { data } = await authApi.verifyOtp({ email, otp, purpose: 'verify' })
      if (data.token) {
        applySession(data.token, data.refreshToken, data.user, email)
        navigate('/student/dashboard')
        return
      }
      navigate('/student/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <NeuralBg nodeCount={45} color="#8B5CF6" opacity={0.45} />
      </div>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div className="auth-logo">
          <div style={{ fontSize: '3rem', marginBottom: 10 }}>🌊</div>
          <h1 className="gradient-text-white" style={{ fontSize: '1.75rem', marginBottom: 6 }}>Join Dream Wave AI</h1>
          <p style={{ fontSize: '0.875rem' }}>Start your AI-powered career intelligence journey</p>
        </div>

        <div className="card" style={{ background: 'rgba(13,13,23,0.9)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <h2 style={{ marginBottom: 22, fontSize: '1.25rem' }}>
            {step === 'otp' ? 'Verify your email' : 'Create your account'}
          </h2>

          {step === 'otp' ? (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{info}</p>
              <OtpInput value={otp} onChange={setOtp} accent="#8B5CF6" />
              {error && <div className="alert alert-error">{error}</div>}
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading || otp.length < 6} style={{ width: '100%' }}>
                {loading ? 'Verifying…' : 'Verify & Continue →'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={loading}
                onClick={async () => {
                  setLoading(true); setError('')
                  try {
                    await authApi.resendOtp({ email, purpose: 'verify' })
                    setInfo('A new code was sent to your email.')
                  } catch (err) {
                    setError(err.response?.data?.message || 'Could not resend code.')
                  } finally {
                    setLoading(false)
                  }
                }}
              >
                Resend code
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="label">Full name</label>
                <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
              </div>
              <div className="form-group">
                <label className="label">Email address</label>
                <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label className="label">Password</label>
                <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters" required minLength={8} />
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 4, width: '100%' }}>
                {loading ? <><div className="spinner" style={{ borderTopColor: 'white' }} /> Creating account…</> : 'Create Account →'}
              </button>
            </form>
          )}

          <p style={{ marginTop: 18, textAlign: 'center', fontSize: '0.845rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/student/login" style={{ color: 'var(--purple-light)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
