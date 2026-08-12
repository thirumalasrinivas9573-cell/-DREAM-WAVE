import { Link } from 'react-router-dom'
import OtpInput from './OtpInput'
import usePortalAuth from '../../auth/usePortalAuth'

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
 * Shared production login for Institution & Company.
 * Email/mobile + password (no login OTP). Reset-password still uses email code.
 */
export default function PortalLoginForm({
  portal,
  portalLabel,
  icon,
  accent,
  accentLight,
  signupPath,
  cssClass = '',
}) {
  const auth = usePortalAuth(portal)

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
          <p style={{ margin: 0, opacity: 0.6, fontSize: '0.875rem' }}>
            Email or mobile · password
          </p>
        </div>

        {auth.forgot === 'otp' ? (
          <form onSubmit={auth.handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {auth.info && <div style={{ color: accentLight, fontSize: '0.82rem' }}>{auth.info}</div>}
            <OtpInput value={auth.resetOtp} onChange={auth.setResetOtp} accent={accent} />
            <input
              type="password"
              placeholder="New password (letter + number, 8+)"
              value={auth.newPassword}
              onChange={(e) => auth.setNewPassword(e.target.value)}
              required
              minLength={8}
              style={fieldStyle(accent)}
            />
            {auth.error && <div style={{ color: '#F87171', fontSize: '0.82rem' }}>{auth.error}</div>}
            <button type="submit" disabled={auth.loading} style={{ padding: '12px', borderRadius: 10, border: 'none', background: accent, color: '#0B1220', fontWeight: 700, cursor: 'pointer' }}>
              {auth.loading ? 'Updating...' : 'Reset Password'}
            </button>
            <button type="button" onClick={() => auth.setForgot(false)} style={{ background: 'none', border: 'none', color: accentLight, cursor: 'pointer' }}>← Back to login</button>
          </form>
        ) : auth.forgot ? (
          <form onSubmit={auth.handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="email"
              placeholder="Account email"
              value={auth.resetEmail || (String(auth.identifier).includes('@') ? auth.identifier : '')}
              onChange={(e) => auth.setResetEmail(e.target.value)}
              required
              style={fieldStyle(accent)}
            />
            {auth.error && <div style={{ color: '#F87171', fontSize: '0.82rem' }}>{auth.error}</div>}
            <button type="submit" disabled={auth.loading} style={{ padding: '12px', borderRadius: 10, border: 'none', background: accent, color: '#0B1220', fontWeight: 700, cursor: 'pointer' }}>
              {auth.loading ? 'Sending...' : 'Send Reset Code'}
            </button>
            <button type="button" onClick={() => auth.setForgot(false)} style={{ background: 'none', border: 'none', color: accentLight, cursor: 'pointer' }}>← Back to login</button>
          </form>
        ) : (
          <form onSubmit={auth.handleCredentials} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="text"
              placeholder="Email or mobile (+91…)"
              value={auth.identifier}
              onChange={(e) => auth.setIdentifier(e.target.value)}
              required
              autoComplete="username"
              style={fieldStyle(accent)}
            />
            <input
              type="password"
              placeholder="Password"
              value={auth.password}
              onChange={(e) => auth.setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={fieldStyle(accent)}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: accentLight }}>
              <input type="checkbox" checked={auth.remember} onChange={(e) => auth.setRemember(e.target.checked)} />
              Remember me
            </label>
            {auth.error && <div style={{ color: '#F87171', fontSize: '0.82rem' }}>{auth.error}</div>}
            {auth.signupCta && (
              <Link
                to={auth.signupCta}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `1px solid ${accent}55`,
                  color: accentLight,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                {portal === 'institution' ? 'Create Institution Account' : portal === 'company' ? 'Create Company Account' : 'Create Student Account'}
              </Link>
            )}
            {auth.info && <div style={{ color: accentLight, fontSize: '0.82rem' }}>{auth.info}</div>}
            <button type="submit" disabled={auth.loading} style={{ padding: '12px', borderRadius: 10, border: 'none', background: accent, color: '#0B1220', fontWeight: 700, cursor: 'pointer' }}>
              {auth.loading ? 'Signing in...' : 'Sign In'}
            </button>
            <button type="button" onClick={() => auth.setForgot(true)} style={{ background: 'none', border: 'none', color: accentLight, cursor: 'pointer', fontSize: '0.82rem' }}>
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
