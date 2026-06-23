import { useState } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user, logout } = useAuth()
  const [notifs, setNotifs] = useState({ email: true, push: false, weekly: true })
  const [saved, setSaved]   = useState(false)

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  const Toggle = ({ on, onChange }) => (
    <button onClick={onChange} style={{ width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', background: on ? 'linear-gradient(135deg,var(--purple),var(--purple-mid))' : 'var(--border)', transition: 'var(--t)', position: 'relative', flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: on ? 23 : 3, transition: 'var(--t)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
    </button>
  )

  return (
    <Layout>
      <div className="page-header"><h1>⚙️ <span className="gradient-text">Settings</span></h1><p>Manage your account, notifications, and preferences</p></div>

      <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Account */}
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>👤 Account Information</h3>
          {[
            { l: 'Name', v: user?.name, action: <a href="/profile" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>Edit</a> },
            { l: 'Email', v: user?.email, action: <span className="badge badge-green">Verified</span> },
            { l: 'Dream Wave ID', v: user?.aaid, action: <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard?.writeText(user?.aaid)}>Copy</button> },
            { l: 'Plan', v: user?.plan === 'pro' ? 'Pro Plan ⭐' : 'Free Plan', action: user?.plan !== 'pro' ? <button className="btn btn-primary btn-sm">⬆️ Upgrade</button> : null },
          ].map(row => (
            <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div><div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{row.l}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.v}</div></div>
              {row.action}
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>🔔 Notifications</h3>
          {[
            { k:'email',  l:'Email notifications', d:'Receive updates via email' },
            { k:'push',   l:'Push notifications',  d:'Browser push notifications' },
            { k:'weekly', l:'Weekly report',        d:'Get weekly progress summary' },
          ].map(({ k, l, d }) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div><div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{l}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d}</div></div>
              <Toggle on={notifs[k]} onChange={() => setNotifs(n => ({ ...n, [k]: !n[k] }))} />
            </div>
          ))}
        </div>

        {/* Danger zone */}
        <div className="card" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
          <h3 style={{ marginBottom: 14 }}>⚠️ Danger Zone</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>🔑 Change Password</button>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>📂 Export My Data</button>
            <button className="btn btn-danger" style={{ justifyContent: 'flex-start' }} onClick={() => confirm('Delete account permanently?') && logout()}>🗑️ Delete Account</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={save}>{saved ? '✅ Saved!' : 'Save Settings'}</button>
          <button className="btn btn-secondary" onClick={logout}>Sign Out</button>
        </div>
      </div>
    </Layout>
  )
}
