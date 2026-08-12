import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../../services/api'
import { setSelectedPortal } from '../../auth/portalSession'

export default function PortalSignupForm({
  portal,
  portalLabel,
  icon,
  accent,
  accentLight,
  loginPath,
  cssClass = '',
}) {
  const [step, setStep] = useState('account')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [registrationToken, setRegistrationToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAccount = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      setSelectedPortal(portal)
      const { data } = await authApi.portalInit({ name, email, portal })
      setRegistrationToken(data.registrationToken)
      setStep(data.step === 'password' ? 'password' : 'password')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start registration')
    } finally { setLoading(false) }
  }

  const complete = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { data } = await authApi.portalComplete({
        password, confirmPassword, organizationName, portal, registrationToken,
      })
      localStorage.setItem('token', data.token)
      setSelectedPortal(portal)
      setStep('done')
      window.location.href = portal === 'institution' ? '/institution/dashboard' : '/company/dashboard'
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className={cssClass} style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 440, padding: 32, borderRadius: 20, background: 'rgba(7,18,16,0.92)', border: `1px solid ${accent}33` }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '2.5rem' }}>{icon}</div>
          <h1 style={{ margin: '0 0 6px' }}>{portalLabel} Sign Up</h1>
          <p style={{ margin: 0, opacity: 0.6, fontSize: '0.85rem' }}>
            Create your {portalLabel.toLowerCase()} account — same email can own Student, Institution, and Company profiles
          </p>
        </div>

        {step === 'account' && (
          <form onSubmit={handleAccount} style={{ display: 'grid', gap: 12 }}>
            <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required className="portal-input" style={inputStyle(accent)} />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="portal-input" style={inputStyle(accent)} />
            {error && <Err msg={error} />}
            <button type="submit" disabled={loading} style={btnStyle(accent)}>{loading ? 'Continuing…' : 'Continue'}</button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={complete} style={{ display: 'grid', gap: 12 }}>
            <input placeholder="Organization name" value={organizationName} onChange={e => setOrganizationName(e.target.value)} required style={inputStyle(accent)} />
            <input type="password" placeholder="Password (8+ chars)" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} style={inputStyle(accent)} />
            <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={inputStyle(accent)} />
            {error && <Err msg={error} />}
            <button type="submit" disabled={loading} style={btnStyle(accent)}>Create Account</button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.82rem', opacity: 0.6 }}>
          Have an account? <Link to={loginPath} style={{ color: accentLight }}>Sign in</Link>
          {' · '}
          <Link to="/" style={{ color: accentLight }}>Home</Link>
        </p>
      </motion.div>
    </div>
  )
}

function inputStyle(accent) {
  return { padding: '12px 14px', borderRadius: 10, border: `1px solid ${accent}33`, background: 'rgba(0,0,0,0.35)', color: '#fff', width: '100%' }
}
function btnStyle(accent) {
  return { padding: '12px', borderRadius: 10, border: 'none', background: accent, color: '#0B1220', fontWeight: 700, cursor: 'pointer' }
}
function Err({ msg }) {
  return <div style={{ color: '#F87171', fontSize: '0.82rem' }}>{msg}</div>
}
