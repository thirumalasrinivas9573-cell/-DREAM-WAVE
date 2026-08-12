import { Link } from 'react-router-dom'
import NeuralBg from '@shared/components/animations/NeuralBg'
import OtpInput from '@shared/components/auth/OtpInput'
import usePortalAuth from '@shared/auth/usePortalAuth'

/**
 * Student login — email/mobile + password (no email/OTP verification).
 * Password-reset still uses a one-time email code.
 */
export default function Login() {
  const auth = usePortalAuth('student')

  return (
    <div className="auth-page" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <NeuralBg nodeCount={45} color="#8B5CF6" opacity={0.45} />
      </div>

      <div className="auth-card" style={{ position: 'relative', zIndex: 1 }}>
        <div className="auth-logo">
          <div style={{ fontSize: '3rem', marginBottom: 10 }}>🌊</div>
          <h1 className="gradient-text-white" style={{ fontSize: '1.75rem', marginBottom: 6 }}>Dream Wave AI</h1>
          <p style={{ fontSize: '0.875rem' }}>Your AI-powered career intelligence platform</p>
        </div>

        <div className="card" style={{ background: 'rgba(13,13,23,0.9)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <h2 style={{ marginBottom: 22, fontSize: '1.25rem' }}>
            {auth.forgot ? 'Reset password' : 'Welcome back'}
          </h2>

          {auth.forgot === 'otp' ? (
            <form onSubmit={auth.handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {auth.info && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{auth.info}</p>}
              <OtpInput value={auth.resetOtp} onChange={auth.setResetOtp} accent="#8B5CF6" />
              <div className="form-group">
                <label className="label">New password</label>
                <input type="password" className="input" value={auth.newPassword} onChange={(e) => auth.setNewPassword(e.target.value)}
                  placeholder="Letter + number, 8+" required minLength={8} autoComplete="new-password" />
              </div>
              {auth.error && <div className="alert alert-error">{auth.error}</div>}
              <button type="submit" className="btn btn-primary btn-lg" disabled={auth.loading} style={{ width: '100%' }}>
                {auth.loading ? 'Updating…' : 'Reset Password'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => auth.setForgot(false)}>← Back to login</button>
            </form>
          ) : auth.forgot ? (
            <form onSubmit={auth.handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="label">Email address</label>
                <input type="email" className="input" value={auth.resetEmail || (String(auth.identifier).includes('@') ? auth.identifier : '')}
                  onChange={(e) => auth.setResetEmail(e.target.value)} required autoComplete="email" />
              </div>
              {auth.error && <div className="alert alert-error">{auth.error}</div>}
              <button type="submit" className="btn btn-primary btn-lg" disabled={auth.loading} style={{ width: '100%' }}>
                {auth.loading ? 'Sending…' : 'Send Reset Code'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => auth.setForgot(false)}>← Back to login</button>
            </form>
          ) : (
            <form onSubmit={auth.handleCredentials} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="label">Email or mobile</label>
                <input type="text" className="input" value={auth.identifier} onChange={(e) => auth.setIdentifier(e.target.value)}
                  placeholder="you@example.com or +91…" required autoComplete="username" />
              </div>
              <div className="form-group">
                <label className="label">Password</label>
                <input type="password" className="input" value={auth.password} onChange={(e) => auth.setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password" />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.845rem', color: 'var(--text-muted)' }}>
                <input type="checkbox" checked={auth.remember} onChange={(e) => auth.setRemember(e.target.checked)} />
                Remember me
              </label>
              {auth.error && <div className="alert alert-error">{auth.error}</div>}
              {auth.signupCta && (
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Need this portal? <Link to={auth.signupCta} style={{ color: '#C4B5FD' }}>Create account</Link>
                </p>
              )}
              <button type="submit" className="btn btn-primary btn-lg" disabled={auth.loading} style={{ width: '100%' }}>
                {auth.loading ? 'Signing in…' : 'Sign In →'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => auth.setForgot(true)}>Forgot password?</button>
            </form>
          )}

          {!auth.forgot && (
            <p style={{ marginTop: 18, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              New here?{' '}
              <Link to="/student/signup" style={{ color: '#C4B5FD' }}>Create account</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
