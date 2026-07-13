import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../services/api'
import OtpInput from './OtpInput'

export default function PortalLoginForm({
  portal,
  portalLabel,
  icon,
  accent,
  accentLight,
  dashboardPath,
  signupPath,
  cssClass = '',
  otpChannel = 'email',
}) {
  const { login, verifyLoginEmailOtp, verifyPhoneOtp, rememberedEmail } = useAuth()
  const [email, setEmail] = useState(rememberedEmail())
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(Boolean(rememberedEmail()))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('credentials')
  const [challenge, setChallenge] = useState(null)
  const [otp, setOtp] = useState('')
  const [forgot, setForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetOtp, setResetOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [info, setInfo] = useState('')

  const finishLogin = async (data) => {
    if (data.token) window.location.href = dashboardPath
  }

  const handleCredentials = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const data = await login(email, password, portal, { otpChannel, remember })
      if (data.requiresOtp) {
        setChallenge(data)
        setStep('otp')
        setInfo(data.requiresEmailOtp
          ? `Code sent to ${data.email || email}`
          : `Code sent to ${data.phoneMasked || 'your phone'}`)
        return
      }
      await finishLogin(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.')
    } finally { setLoading(false) }
  }

  const handleOtp = async (e) => {
    e.preventDefault()
    if (otp.length < 6) return setError('Enter the 6-digit code')
    setError(''); setLoading(true)
    try {
      let data
      if (challenge.requiresEmailOtp || challenge.otpChannel === 'email') {
        data = await verifyLoginEmailOtp(challenge.challengeToken, otp, remember ? email : null, remember)
      } else {
        data = await verifyPhoneOtp({
          code: otp,
          challengeToken: challenge.challengeToken,
        }, remember ? email : null, remember)
      }
      await finishLogin(data)
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
    <div className={cssClass} style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%', maxWidth: 420, padding: 32, borderRadius: 20,
          background: 'rgba(7,18,16,0.92)', border: `1px solid ${accent}33`, backdropFilter: 'blur(16px)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{icon}</div>
          <h1 style={{ margin: '0 0 6px', fontSize: '1.5rem' }}>{portalLabel}</h1>
          <p style={{ margin: 0, opacity: 0.6, fontSize: '0.875rem' }}>Secure email & password login</p>
        </div>

        {forgot === 'otp' ? (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <OtpInput value={resetOtp} onChange={setResetOtp} accent={accent} />
            <input type="password" placeholder="New password (8+ chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8}
              style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${accent}33`, background: 'rgba(0,0,0,0.35)', color: '#fff' }} />
            {error && <div style={{ color: '#F87171', fontSize: '0.82rem' }}>{error}</div>}
            {info && <div style={{ color: accentLight, fontSize: '0.82rem' }}>{info}</div>}
            <button type="submit" disabled={loading} style={{ padding: '12px', borderRadius: 10, border: 'none', background: accent, color: '#0B1220', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Updating...' : 'Reset Password'}
            </button>
            <button type="button" onClick={() => setForgot(false)} style={{ background: 'none', border: 'none', color: accentLight, cursor: 'pointer' }}>← Back to login</button>
          </form>
        ) : forgot ? (
          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input type="email" placeholder="Email" value={resetEmail || email} onChange={e => setResetEmail(e.target.value)} required
              style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${accent}33`, background: 'rgba(0,0,0,0.35)', color: '#fff' }} />
            {error && <div style={{ color: '#F87171', fontSize: '0.82rem' }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ padding: '12px', borderRadius: 10, border: 'none', background: accent, color: '#0B1220', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
            <button type="button" onClick={() => setForgot(false)} style={{ background: 'none', border: 'none', color: accentLight, cursor: 'pointer' }}>← Back to login</button>
          </form>
        ) : step === 'otp' ? (
          <form onSubmit={handleOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: accentLight, margin: 0 }}>{info}</p>
            <OtpInput value={otp} onChange={setOtp} accent={accent} />
            {error && <div style={{ color: '#F87171', fontSize: '0.82rem', textAlign: 'center' }}>{error}</div>}
            <button type="submit" disabled={loading || otp.length < 6} style={{ padding: '12px', borderRadius: 10, border: 'none', background: accent, color: '#0B1220', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
            <button type="button" onClick={() => { setStep('credentials'); setOtp(''); setError('') }} style={{ background: 'none', border: 'none', color: accentLight, cursor: 'pointer' }}>← Back</button>
          </form>
        ) : (
          <form onSubmit={handleCredentials} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
              style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${accent}33`, background: 'rgba(0,0,0,0.35)', color: '#fff' }} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
              style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${accent}33`, background: 'rgba(0,0,0,0.35)', color: '#fff' }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: accentLight }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              Remember me
            </label>
            {error && <div style={{ color: '#F87171', fontSize: '0.82rem' }}>{error}</div>}
            {info && <div style={{ color: accentLight, fontSize: '0.82rem' }}>{info}</div>}
            <button type="submit" disabled={loading} style={{ padding: '12px', borderRadius: 10, border: 'none', background: accent, color: '#0B1220', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <button type="button" onClick={() => setForgot(true)} style={{ background: 'none', border: 'none', color: accentLight, cursor: 'pointer', fontSize: '0.82rem' }}>Forgot password?</button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.82rem', opacity: 0.6 }}>
          {signupPath && <>No account? <Link to={signupPath} style={{ color: accentLight }}>Sign up</Link><br /></>}
          <Link to="/" style={{ color: accentLight }}>← Back to portal selection</Link>
        </p>
      </motion.div>
    </div>
  )
}
