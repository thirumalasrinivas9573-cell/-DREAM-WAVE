import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../components/Layout'
import { goalApi } from '../services/api'

const CATS = ['Education','Career','Personal','Health','Finance']
const CAT_COLORS = { Education:'#6366F1', Career:'#8B5CF6', Personal:'#10B981', Health:'#F59E0B', Finance:'#06B6D4' }

function GoalModal({ goal, onClose, onSaved }) {
  const [title, setTitle]       = useState(goal?.title || '')
  const [description, setDesc]  = useState(goal?.description || '')
  const [category, setCat]      = useState(goal?.category || 'Career')
  const [deadline, setDeadline] = useState(goal?.deadline?.slice(0,10) || '')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title required'); return }
    setLoading(true)
    try {
      if (goal) await goalApi.update(goal._id, { title, description, category, deadline: deadline || undefined })
      else await goalApi.create({ title, description, category, deadline: deadline || undefined })
      onSaved()
    } catch (err) { setError(err.response?.data?.message || 'Failed to save') }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20, backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="card" style={{ width: '100%', maxWidth: 480, border: '1px solid var(--border-purple)' }}>
        <h2 style={{ marginBottom: 20 }}>{goal ? 'Edit Goal' : '🎯 New Goal'}</h2>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label className="label">Goal title *</label><input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Become a Full Stack Developer" required autoFocus /></div>
          <div className="form-group"><label className="label">Description</label><textarea className="textarea" value={description} onChange={e => setDesc(e.target.value)} placeholder="What does success look like?" rows={3} /></div>
          <div className="grid-2">
            <div className="form-group"><label className="label">Category</label><select className="select" value={category} onChange={e => setCat(e.target.value)}>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
            <div className="form-group"><label className="label">Target date</label><input type="date" className="input" value={deadline} onChange={e => setDeadline(e.target.value)} /></div>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : goal ? 'Update' : 'Create Goal'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function Goals() {
  const [goals, setGoals]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setModal]   = useState(false)
  const [editGoal, setEdit]     = useState(null)
  const [genId, setGenId]       = useState(null)
  const [filter, setFilter]     = useState('all')

  const load = () => { setLoading(true); goalApi.getAll().then(r => setGoals(r.data.goals || [])).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(load, [])

  const delGoal = async (id) => { if (!confirm('Delete this goal?')) return; await goalApi.delete(id); setGoals(p => p.filter(g => g._id !== id)) }
  const genPlan = async (goal) => {
    setGenId(goal._id)
    try { const { data } = await goalApi.generatePlan(goal._id); setGoals(p => p.map(g => g._id === goal._id ? { ...g, aiPlan: data.steps } : g)) } catch {}
    setGenId(null)
  }

  const filtered = goals.filter(g => filter === 'all' ? true : filter === 'active' ? !g.completed : g.completed)

  return (
    <Layout>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div><h1>🎯 <span className="gradient-text">Goals</span></h1><p>Set ambitious goals and let AI build your complete roadmap</p></div>
          <button className="btn btn-primary" onClick={() => { setEdit(null); setModal(true) }}>+ New Goal</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[{ l:'Total', v:goals.length, c:'#8B5CF6' }, { l:'Active', v:goals.filter(g=>!g.completed).length, c:'#6366F1' }, { l:'Completed', v:goals.filter(g=>g.completed).length, c:'#10B981' }, { l:'Avg Progress', v:goals.length?Math.round(goals.reduce((a,g)=>a+(g.progress||0),0)/goals.length)+'%':'0%', c:'#F59E0B' }].map(s => (
          <div key={s.l} className="stat-card" style={{ background: `${s.c}0d`, border: `1px solid ${s.c}22` }}>
            <div className="stat-icon" style={{ background: `${s.c}18` }}><span style={{ fontSize: '1.2rem' }}>🎯</span></div>
            <div><div className="stat-value" style={{ color: s.c }}>{loading ? '--' : s.v}</div><div className="stat-label">{s.l}</div></div>
          </div>
        ))}
      </div>

      <div className="tab-nav" style={{ marginBottom: 20, width: 'fit-content' }}>
        {[['all','All Goals'],['active','Active'],['completed','Completed']].map(([v,l]) => (
          <button key={v} className={`tab-item ${filter===v?'active':''}`} onClick={() => setFilter(v)}>{l} <span style={{ opacity: 0.6, fontSize: '0.72rem' }}>({v==='all'?goals.length:v==='active'?goals.filter(g=>!g.completed).length:goals.filter(g=>g.completed).length})</span></button>
        ))}
      </div>

      {loading ? <div className="grid-2">{[...Array(4)].map((_,i) => <div key={i} className="skeleton" style={{ height: 200 }} />)}</div>
      : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', border: '1px dashed var(--border-purple)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎯</div>
          <h2 className="gradient-text" style={{ marginBottom: 8 }}>No goals yet</h2>
          <p style={{ marginBottom: 20 }}>Create your first goal and let AI build you a complete career roadmap</p>
          <button className="btn btn-primary btn-lg" onClick={() => setModal(true)}>🚀 Create Your First Goal</button>
        </div>
      ) : (
        <div className="grid-2">
          <AnimatePresence>
            {filtered.map((g, i) => {
              const cc = CAT_COLORS[g.category] || '#8B5CF6'
              return (
                <motion.div key={g._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }} exit={{ opacity: 0, scale: 0.96 }}>
                  <div className="card card-lift" style={{ opacity: g.completed ? 0.7 : 1, height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6, flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '0.9375rem', textDecoration: g.completed ? 'line-through' : 'none' }}>{g.title}</h3>
                          {g.completed && <span className="badge badge-green">✓ Done</span>}
                        </div>
                        <span className="badge" style={{ background: `${cc}15`, color: cc, border: `1px solid ${cc}25`, fontSize: '0.68rem' }}>{g.category}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 5, marginLeft: 8, flexShrink: 0 }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => { setEdit(g); setModal(true) }} style={{ fontSize: '0.85rem' }}>✏️</button>
                        <button className="btn btn-danger btn-icon" onClick={() => delGoal(g._id)} style={{ fontSize: '0.85rem' }}>🗑️</button>
                      </div>
                    </div>
                    {g.description && <p style={{ fontSize: '0.82rem', marginBottom: 12 }}>{g.description}</p>}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Progress</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: g.progress >= 100 ? '#10B981' : 'var(--purple-light)' }}>{g.progress || 0}%</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${g.progress || 0}%`, background: g.progress >= 100 ? 'linear-gradient(90deg,#10B981,#34D399)' : undefined }} /></div>
                    </div>
                    {g.deadline && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>📅 {new Date(g.deadline).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>}
                    {g.aiPlan?.length > 0 && (
                      <div style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid var(--border-purple)', borderRadius: 10, padding: 10, marginBottom: 12 }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--purple-light)', fontWeight: 700, marginBottom: 6 }}>🤖 AI Action Plan</p>
                        {g.aiPlan.slice(0, 2).map((step, j) => <div key={j} style={{ display: 'flex', gap: 5, marginBottom: 3 }}><span style={{ color: 'var(--purple-light)', fontSize: '0.73rem', fontWeight: 700, flexShrink: 0 }}>{j+1}.</span><span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{step}</span></div>)}
                        {g.aiPlan.length > 2 && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>+{g.aiPlan.length - 2} more steps</p>}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 7 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => genPlan(g)} disabled={genId === g._id} style={{ flex: 1 }}>{genId === g._id ? <><div className="spinner" style={{ width: 12, height: 12 }} /> Generating...</> : '🤖 AI Plan'}</button>
                      <Link to={`/roadmap?goalId=${g._id}`} className="btn btn-primary btn-sm" style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}>🗺️ Roadmap</Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
      {showModal && <GoalModal goal={editGoal} onClose={() => { setModal(false); setEdit(null) }} onSaved={() => { setModal(false); setEdit(null); load() }} />}
    </Layout>
  )
}
