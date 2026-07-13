import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../shared/context/AuthContext'
import { authApi } from '../../shared/services/api'
import NeuralBg from '../../shared/components/animations/NeuralBg'
import OtpInput from '../../shared/components/auth/OtpInput'

export default function Login() {
  const {
    login,
    verifyLoginEmailOtp,
    verifyPhoneOtp,
    rememberedEmail,
  } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState(rememberedEmail())
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(Boolean(rememberedEmail()))
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('credentials')
  const [challenge, setChallenge] = useState(null)
  const [otp, setOtp] = useState('')
  const [forgot, setForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetOtp, setResetOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const handleCredentials = async (e) => {
    e.preventDefault()
    setError(''); setInfo(''); setLoading(true)
    try {
      const data = await login(email, password, 'student', { remember, otpChannel: 'phone' })
      if (data.requiresOtp) {
        setChallenge(data)
        setStep('otp')
        setInfo(data.requiresEmailOtp
          ? `Code sent to ${data.email || email}`
          : `Code sent to ${data.phoneMasked || 'your phone'}`)
        return
      }
      navigate('/student/dashboard')
    } catch (err) {
      const code = err.response?.data?.code
      if (code === 'PHONE_REQUIRED') {
        // Fall back to email OTP when phone is not verified
        try {
          const data = await login(email, password, 'student', { remember, otpChannel: 'email' })
          if (data.requiresOtp) {
            setChallenge(data)
            setStep('otp')
            setInfo(`Code sent to ${data.email || email}`)
            return
          }
          navigate('/student/dashboard')
          return
        } catch (err2) {
          setError(err2.response?.data?.message || 'Invalid email or password.')
          return
        }
      }
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally { setLoading(false) }
  }

  const handleOtp = async (e) => {
    e.preventDefault()
    if (otp.length < 6) return setError('Enter the 6-digit code')
    setError(''); setLoading(true)
    try {
      if (challenge.requiresEmailOtp || challenge.otpChannel === 'email') {
        await verifyLoginEmailOtp(challenge.challengeToken, otp, remember ? email : null, remember)
      } else {
        await verifyPhoneOtp({
          phone: challenge.phone,
          code: otp,
          challengeToken: challenge.challengeToken,
        }, remember ? email : null, remember)
      }
      navigate('/student/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.')
    } finally { setLoading(false) }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await authApi.forgotPassword({ email: resetEmail || email })
      setInfo('If an account exists, a reset code was sent to your email.')
      setForgot('otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send reset code.')
    } finally { setLoading(false) }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await authApi.resetPassword({ email: resetEmail || email, otp: resetOtp, password: newPassword })
      setInfo('Password updated. Sign in with your new password.')
      setForgot(false)
      setStep('credentials')
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page" style={{ position: 'relative', overflow: 'hidden' }}>
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
          <h2 style={{ marginBottom: 22, fontSize: '1.25rem' }}>
            {forgot ? 'Reset password' : step === 'otp' ? 'Verify code' : 'Welcome back'}
          </h2>

          {forgot === 'otp' ? (
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{info}</p>
              <OtpInput value={resetOtp} onChange={setResetOtp} accent="#8B5CF6" />
              <div className="form-group">
                <label className="label">New password</label>
                <input type="password" className="input" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="8+ characters" required minLength={8} autoComplete="new-password" />
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Updating…' : 'Reset Password'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setForgot(false)}>← Back to login</button>
            </form>
          ) : forgot ? (
            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="label">Email address</label>
                <input type="email" className="input" value={resetEmail || email}
                  onChange={e => setResetEmail(e.target.value)} required autoComplete="email" />
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Sending…' : 'Send Reset Code'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setForgot(false)}>← Back to login</button>
            </form>
          ) : step === 'otp' ? (
            <form onSubmit={handleOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{info}</p>
              <OtpInput value={otp} onChange={setOtp} accent="#8B5CF6" />
              {error && <div className="alert alert-error">{error}</div>}
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading || otp.length < 6} style={{ width: '100%' }}>
                {loading ? 'Verifying…' : 'Verify & Sign In →'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => { setStep('credentials'); setOtp(''); setError('') }}>← Back</button>
            </form>
          ) : (
            <form onSubmit={handleCredentials} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.845rem', color: 'var(--text-muted)' }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                Remember me
              </label>
              {error && <div className="alert alert-error">{error}</div>}
              {info && <div className="alert alert-success">{info}</div>}
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 4, width: '100%' }}>
                {loading ? <><div className="spinner" style={{ borderTopColor: 'white' }} /> Signing in…</> : 'Sign In →'}
              </button>
              <button type="button" onClick={() => { setForgot(true); setResetEmail(email); setError(''); setInfo('') }}
                style={{ background: 'none', border: 'none', color: 'var(--purple-light)', cursor: 'pointer', fontSize: '0.845rem' }}>
                Forgot password?
              </button>
            </form>
          )}

          {!forgot && step === 'credentials' && (
            <p style={{ marginTop: 18, textAlign: 'center', fontSize: '0.845rem', color: 'var(--text-muted)' }}>
              New to Dream Wave?{' '}
              <Link to="/student/signup" style={{ color: 'var(--purple-light)', fontWeight: 600 }}>Create account</Link>
              {' · '}
              <Link to="/" style={{ color: 'var(--purple-light)', fontWeight: 600 }}>All portals</Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
