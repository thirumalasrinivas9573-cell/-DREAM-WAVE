import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

function formatUa(ua) {
  if (!ua) return 'Unknown device'
  if (/Mobile|Android|iPhone/i.test(ua)) return 'Mobile browser'
  if (/Mac OS|Macintosh/i.test(ua)) return 'Mac browser'
  if (/Windows/i.test(ua)) return 'Windows browser'
  if (/Linux/i.test(ua)) return 'Linux browser'
  return ua.slice(0, 64)
}

export default function DeviceSessions() {
  const { listSessions, revokeSession, revokeAllSessions, logout } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await listSessions()
      setSessions(data.sessions || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load sessions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onRevoke = async (id, isCurrent) => {
    if (isCurrent) {
      if (!confirm('Sign out this device?')) return
      await logout(false)
      window.location.href = '/student/login'
      return
    }
    await revokeSession(id)
    await load()
  }

  const onRevokeAll = async () => {
    if (!confirm('Sign out all devices? You will need to sign in again.')) return
    await revokeAllSessions()
    await logout(false)
    window.location.href = '/'
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: 14 }}>Device sessions</h3>
      {loading && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading…</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && sessions.length === 0 && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No active sessions.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sessions.map((s) => (
          <div
            key={s.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              padding: '10px 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div>
              <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                {formatUa(s.userAgent)}
                {s.current ? ' · This device' : ''}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Last used {s.lastUsedAt ? new Date(s.lastUsedAt).toLocaleString() : '—'}
                {s.remember ? ' · Remembered' : ' · Short session'}
              </div>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onRevoke(s.id, s.current)}>
              Revoke
            </button>
          </div>
        ))}
      </div>
      {sessions.length > 1 && (
        <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={onRevokeAll}>
          Sign out all devices
        </button>
      )}
    </div>
  )
}
