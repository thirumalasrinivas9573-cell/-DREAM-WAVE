import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { goalApi, taskApi, profileApi } from '../services/api'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [goals, setGoals]   = useState([])
  const [tasks, setTasks]   = useState([])
  const [loading, setLoad]  = useState(true)
  const [editing, setEdit]  = useState(false)
  const [name, setName]     = useState(user?.name || '')
  const [saving, setSave]   = useState(false)
  const [msg, setMsg]       = useState('')

  useEffect(() => {
    Promise.all([goalApi.getAll(), taskApi.getAll()])
      .then(([g, t]) => { setGoals(g.data.goals || []); setTasks(t.data.tasks || []) })
      .catch(() => {}).finally(() => setLoad(false))
  }, [])

  const save = async () => {
    setSave(true)
    try {
      const { data } = await profileApi.update({ name })
      updateUser({ name: data.user?.name || name })
      setEdit(false); setMsg('Profile updated!'); setTimeout(() => setMsg(''), 3000)
    } catch { setMsg('Failed to update.') }
    setSave(false)
  }

  const completedGoals = goals.filter(g => g.completed).length
  const activeGoals    = goals.filter(g => !g.completed).length
  const completedTasks = tasks.filter(t => t.completed).length
  const avgProgress    = goals.length ? Math.round(goals.reduce((a, g) => a + (g.progress || 0), 0) / goals.length) : 0

  const STATS = [
    { icon:'🎯', l:'Total Goals',   v:goals.length,    c:'#8B5CF6' },
    { icon:'✅', l:'Completed',     v:completedGoals,  c:'#10B981' },
    { icon:'⚡', l:'Active Goals',  v:activeGoals,     c:'#F59E0B' },
    { icon:'📝', l:'Tasks Done',    v:completedTasks,  c:'#6366F1' },
    { icon:'📈', l:'Avg Progress',  v:avgProgress+'%', c:'#06B6D4' },
    { icon:'🔥', l:'Day Streak',    v:user?.streak||0, c:'#EF4444' },
  ]

  return (
    <Layout>
      <div className="page-header"><h1>👤 <span className="gradient-text">Profile</span></h1><p>Your Dream Wave AI journey and achievements</p></div>

      {/* Profile card */}
      <div className="card card-purple" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#C084FC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700, flexShrink: 0, color: 'white', boxShadow: '0 4px 20px rgba(139,92,246,0.4)' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            {editing ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <input className="input" value={name} onChange={e => setName(e.target.value)} style={{ maxWidth: 280 }} autoFocus />
                <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? <div className="spinner" style={{ borderTopColor: 'white', width: 13, height: 13 }} /> : 'Save'}</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setEdit(false)}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h2 style={{ fontSize: '1.25rem' }}>{user?.name}</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setEdit(true)} style={{ fontSize: '0.85rem' }}>✏️</button>
              </div>
            )}
            {msg && <span className="badge badge-green" style={{ marginBottom: 8, display: 'inline-block' }}>{msg}</span>}
            <p style={{ marginBottom: 10, fontSize: '0.845rem' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {user?.aaid && <span className="badge badge-purple">ID: {user.aaid}</span>}
              <span className="badge badge-blue">Level {user?.level || 1}</span>
              <span className="badge badge-yellow">⚡ {user?.credits || 0} XP</span>
              <span className={`badge ${user?.plan === 'pro' ? 'badge-green' : 'badge-gray'}`}>{user?.plan === 'pro' ? '⭐ Pro' : '🆓 Free'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {STATS.map(s => (
          <div key={s.l} className="stat-card" style={{ background: `${s.c}0d`, border: `1px solid ${s.c}22` }}>
            <div className="stat-icon" style={{ background: `${s.c}18` }}><span style={{ fontSize: '1.2rem' }}>{s.icon}</span></div>
            <div><div className="stat-value" style={{ color: s.c }}>{loading ? '--' : s.v}</div><div className="stat-label">{s.l}</div></div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Goal progress */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>🎯 Goal Progress</h3>
          {loading ? [...Array(3)].map((_,i) => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 10 }} />) :
          goals.length === 0 ? <div className="empty-state" style={{ padding: '20px 0' }}><p>No goals yet</p></div> :
          goals.slice(0, 5).map(g => (
            <div key={g._id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: '0.845rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{g.title}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {g.completed && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Done</span>}
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--purple-light)' }}>{g.progress}%</span>
                </div>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${g.progress}%`, background: g.progress >= 100 ? 'linear-gradient(90deg,#10B981,#34D399)' : undefined }} /></div>
            </div>
          ))}
        </div>

        {/* Activity */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📊 Activity Summary</h3>
          {[
            { l:'Goals created',    v:goals.length,     i:'🎯' },
            { l:'Goals completed',  v:completedGoals,   i:'🏆' },
            { l:'Tasks completed',  v:completedTasks,   i:'✅' },
            { l:'Learning streak',  v:`${user?.streak||0} days`, i:'🔥' },
            { l:'Total XP',         v:user?.credits||0, i:'⚡' },
            { l:'Account level',    v:user?.level||1,   i:'⬆️' },
          ].map(row => (
            <div key={row.l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:'0.845rem', color:'var(--text-secondary)', display:'flex', gap:7, alignItems:'center' }}><span>{row.i}</span>{row.l}</span>
              <span style={{ fontWeight:700, color:'var(--text-primary)', fontSize:'0.9rem' }}>{loading ? '--' : row.v}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
