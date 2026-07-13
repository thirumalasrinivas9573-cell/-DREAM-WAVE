import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../services/api'
import OtpInput from './OtpInput'

const fieldStyle = (accent) => ({
  padding: '12px 14px',
  borderRadius: 10,
  border: `1px solid ${accent}33`,
  background: 'rgba(0,0,0,0.35)',
  color: '#fff',
  width: '100%',
  boxSizing: 'border-box',
})

/**
 * Shared production login for Institution & Company (and reusable).
 * Email or mobile + password → OTP. No motion animations.
 */
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
  const [identifier, setIdentifier] = useState(rememberedEmail())
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
    setError(''); setInfo(''); setLoading(true)
    try {
      const data = await login(identifier, password, portal, { otpChannel, remember })
      if (data.requiresOtp) {
        setChallenge(data)
        setStep('otp')
        setInfo(data.requiresEmailOtp
          ? `Code sent to ${data.email || identifier}`
          : `Code sent to ${data.phoneMasked || 'your phone'}`)
        return
      }
      await finishLogin(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtp = async (e) => {
    e.preventDefault()
    if (otp.length < 6) return setError('Enter the 6-digit code')
    setError(''); setLoading(true)
    try {
      let data
      const rememberEmail = remember && identifier.includes('@') ? identifier : null
      if (challenge.requiresEmailOtp || challenge.otpChannel === 'email') {
        data = await verifyLoginEmailOtp(challenge.challengeToken, otp, rememberEmail, remember)
      } else {
        data = await verifyPhoneOtp({
          code: otp,
          challengeToken: challenge.challengeToken,
        }, rememberEmail, remember)
      }
      await finishLogin(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await authApi.forgotPassword({ email: resetEmail || (identifier.includes('@') ? identifier : '') })
      setInfo('If an account exists, a reset code was sent to your email.')
      setForgot('otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send reset code.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await authApi.resetPassword({
        email: resetEmail || identifier,
        otp: resetOtp,
        password: newPassword,
      })
      setInfo('Password updated. Sign in with your new password.')
      setForgot(false)
      setStep('credentials')
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cssClass} style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 32,
          borderRadius: 20,
          background: 'rgba(7,18,16,0.92)',
          border: `1px solid ${accent}33`,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{icon}</div>
          <h1 style={{ margin: '0 0 6px', fontSize: '1.5rem' }}>{portalLabel}</h1>
          <p style={{ margin: 0, opacity: 0.6, fontSize: '0.875rem' }}>Email or mobile · password · OTP</p>
        </div>

        {forgot === 'otp' ? (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {info && <div style={{ color: accentLight, fontSize: '0.82rem' }}>{info}</div>}
            <OtpInput value={resetOtp} onChange={setResetOtp} accent={accent} />
            <input
              type="password"
              placeholder="New password (letter + number, 8+)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              style={fieldStyle(accent)}
            />
            {error && <div style={{ color: '#F87171', fontSize: '0.82rem' }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ padding: '12px', borderRadius: 10, border: 'none', background: accent, color: '#0B1220', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Updating...' : 'Reset Password'}
            </button>
            <button type="button" onClick={() => setForgot(false)} style={{ background: 'none', border: 'none', color: accentLight, cursor: 'pointer' }}>← Back to login</button>
          </form>
        ) : forgot ? (
          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="email"
              placeholder="Account email"
              value={resetEmail || (identifier.includes('@') ? identifier : '')}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              style={fieldStyle(accent)}
            />
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
            <input
              type="text"
              placeholder="Email or mobile (+91…)"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
              style={fieldStyle(accent)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={fieldStyle(accent)}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: accentLight }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            {error && <div style={{ color: '#F87171', fontSize: '0.82rem' }}>{error}</div>}
            {info && <div style={{ color: accentLight, fontSize: '0.82rem' }}>{info}</div>}
            <button type="submit" disabled={loading} style={{ padding: '12px', borderRadius: 10, border: 'none', background: accent, color: '#0B1220', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <button type="button" onClick={() => setForgot(true)} style={{ background: 'none', border: 'none', color: accentLight, cursor: 'pointer', fontSize: '0.82rem' }}>
              Forgot password?
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.82rem', opacity: 0.6 }}>
          {signupPath && <>No account? <Link to={signupPath} style={{ color: accentLight }}>Sign up</Link><br /></>}
          <Link to="/" style={{ color: accentLight }}>← Back to portal selection</Link>
        </p>
      </div>
    </div>
  )
}
