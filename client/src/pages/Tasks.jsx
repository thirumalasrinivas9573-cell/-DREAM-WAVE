import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../components/Layout'
import { taskApi, goalApi, roadmapApi } from '../services/api'
import MessageRenderer from '../components/MessageRenderer'
import { ConfettiBurst, XPBurst, SkillMasteredCard, AnimatedCheckmark } from '../components/animations/TaskCompleteEffect'

// ── Expandable task card with full rich-content display ───────────────────────
function ExpandableTask({ t, meta, onToggle, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const wordCount = t.description ? t.description.trim().split(/\s+/).length : 0
  const isRich = wordCount > 80

  return (
    <motion.div layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} style={{ marginBottom: 8 }}>
      <div className="card" style={{ padding: 0, overflow: 'hidden', opacity: t.completed ? 0.6 : 1, borderLeft: `3px solid ${meta.color}` }}>
        {/* Task header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '12px 14px' }}>
          <button onClick={() => onToggle(t)} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${t.completed ? 'transparent' : 'var(--border)'}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, transition: 'var(--t)', padding: 0 }}>
            {t.completed
              ? <AnimatedCheckmark size={22} color="#10B981" />
              : <div style={{ width: 14, height: 14, borderRadius: 4 }} />
            }
          </button>
          {t.type && <span style={{ width: 26, height: 26, borderRadius: 7, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0, marginTop: 1 }}>{meta.icon}</span>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)', lineHeight: 1.4 }}>{t.title}</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                {isRich && <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 600 }}>{wordCount}w</span>}
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.priority === 'High' ? '#EF4444' : t.priority === 'Medium' ? '#F59E0B' : '#64748B', flexShrink: 0 }} />
                <button onClick={() => onDelete(t._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '2px 5px', borderRadius: 5, transition: 'var(--t)', lineHeight: 1 }} onMouseEnter={e => e.currentTarget.style.color = '#F87171'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>✕</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 5, flexWrap: 'wrap' }}>
              {t.estimatedTime && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>⏱ {t.estimatedTime}</span>}
              {t.type && <span style={{ fontSize: '0.68rem', color: meta.color, background: meta.bg, padding: '1px 7px', borderRadius: 999, fontWeight: 600 }}>{meta.label || t.type}</span>}
              {isRich && (
                <button onClick={() => setExpanded(v => !v)} style={{ fontSize: '0.7rem', color: expanded ? 'var(--purple-light)' : 'var(--text-muted)', background: expanded ? 'rgba(139,92,246,0.1)' : 'transparent', border: `1px solid ${expanded ? 'var(--border-purple)' : 'var(--border)'}`, borderRadius: 999, padding: '1px 8px', cursor: 'pointer', transition: 'var(--t)', fontFamily: 'inherit' }}>
                  {expanded ? '▲ Hide content' : '▼ View full content'}
                </button>
              )}
            </div>
            {/* Short preview (first 100 chars) when not rich or not expanded */}
            {t.description && !isRich && (
              <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginTop: 6 }}>{t.description}</p>
            )}
            {t.description && isRich && !expanded && (
              <p style={{ fontSize: '0.8rem', lineHeight: 1.55, color: 'var(--text-muted)', marginTop: 5, fontStyle: 'italic' }}>
                {t.description.slice(0, 120)}... <button onClick={() => setExpanded(true)} style={{ background: 'none', border: 'none', color: 'var(--purple-light)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit' }}>read more</button>
              </p>
            )}
          </div>
        </div>

        {/* Expanded rich content */}
        <AnimatePresence>
          {isRich && expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
              <div style={{ padding: '4px 14px 16px 14px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)' }}>
                <div style={{ fontSize: '0.875rem', lineHeight: 1.8 }}>
                  <MessageRenderer content={t.description} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

const TYPE = {
  learn:    { icon: '📖', label: 'Learn',    color: '#6366F1', bg: 'rgba(99,102,241,0.1)'   },
  quiz:     { icon: '❓', label: 'Quiz',     color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'   },
  practice: { icon: '⚒️', label: 'Practice', color: '#10B981', bg: 'rgba(16,185,129,0.1)'   },
  revise:   { icon: '🔁', label: 'Revise',   color: '#A855F7', bg: 'rgba(168,85,247,0.1)'   },
}

const FLOW_DAYS = [
  { day: 1, type: 'learn',    icon: '📖', label: 'Day 1: Learn',    desc: 'Study the concept deeply' },
  { day: 2, type: 'quiz',     icon: '❓', label: 'Day 2: Test',     desc: 'Test your understanding' },
  { day: 3, type: 'practice', icon: '⚒️', label: 'Day 3: Practice', desc: 'Build something real' },
  { day: 4, type: 'revise',   icon: '🔁', label: 'Day 4: Revise',   desc: 'Reinforce weak points' },
  { day: 5, type: 'learn',    icon: '🚀', label: 'Day 5: Next',     desc: 'Move to next skill' },
]

export default function Tasks() {
  const [tasks, setTasks]         = useState([])
  const [goals, setGoals]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [adding, setAdding]       = useState(false)
  const [filter, setFilter]       = useState('all')
  const [typeFilter, setType]     = useState('all')
  const [generating, setGen]      = useState(false)
  const [genGoalId, setGenGoalId] = useState('')
  const [genError, setGenError]   = useState('')
  const [newTitle, setNewTitle]   = useState('')
  const [newPriority, setPriority]= useState('Medium')
  const [newGoalId, setNewGoalId] = useState('')
  const [creating, setCreating]   = useState(false)
  // ── Achievement effects ────────────────────────────────────────────────────
  const [bursts, setBursts]         = useState([])  // confetti
  const [xpBursts, setXpBursts]     = useState([])  // XP floaters
  const [skillCard, setSkillCard]   = useState(null) // skill mastered

  const load = () => {
    setLoading(true)
    Promise.all([taskApi.getAll(), goalApi.getAll()])
      .then(([t, g]) => {
        setTasks(t.data.tasks || [])
        const gl = g.data.goals || []
        setGoals(gl)
        if (gl.length && !genGoalId) setGenGoalId(gl[0]._id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const toggle = async (task) => {
    const next = !task.completed
    setTasks(p => p.map(t => t._id === task._id ? { ...t, completed: next } : t))
    try {
      await taskApi.update(task._id, { completed: next })
      if (next) {
        // Fire confetti + XP burst at approximate position
        const xp = task.type === 'practice' ? 20 : task.type === 'quiz' ? 15 : 10
        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2
        const id = Date.now()
        setBursts(p => [...p, { id, x: cx, y: cy }])
        setXpBursts(p => [...p, { id: id + 1, amount: xp, x: cx - 20, y: cy - 40 }])

        // Check if all tasks for a day are done
        const dayTag = task.day ? `Day ${task.day}` : null
        if (dayTag) {
          const dayTasks = tasks.filter(t => t.day === task.day)
          const nowDone  = dayTasks.filter(t => t._id === task._id ? true : t.completed).length
          if (nowDone === dayTasks.length && dayTasks.length >= 2) {
            setTimeout(() => {
              setSkillCard({ skill: task.category || 'Daily Skills', xp: xp * dayTasks.length })
            }, 900)
          }
        }
      }
    } catch { setTasks(p => p.map(t => t._id === task._id ? task : t)) }
  }

  const del = async (id) => {
    setTasks(p => p.filter(t => t._id !== id))
    try { await taskApi.delete(id) } catch {}
  }

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const { data } = await taskApi.create({ title: newTitle, priority: newPriority, goalId: newGoalId || undefined })
      setTasks(p => [data.task, ...p])
      setNewTitle(''); setAdding(false)
    } catch {} finally { setCreating(false) }
  }

  const generatePlan = async () => {
    if (!genGoalId) return
    setGen(true); setGenError('')
    try {
      const rmRes = await roadmapApi.get(genGoalId)
      const roadmapId = rmRes.data?.roadmap?._id
      if (!roadmapId) { setGenError('No roadmap found. Generate a roadmap for this goal first.'); setGen(false); return }
      await taskApi.generate({ goalId: genGoalId, roadmapId })
      load()
    } catch (err) {
      setGenError(err.response?.status === 404 ? 'No roadmap found. Go to Roadmap page and generate one first.' : err.response?.data?.message || 'Generation failed.')
    }
    setGen(false)
  }

  const pending   = tasks.filter(t => !t.completed).length
  const done      = tasks.filter(t => t.completed).length
  const todayDone = tasks.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === new Date().toDateString()).length
  const byType    = Object.fromEntries(Object.keys(TYPE).map(k => [k, tasks.filter(t => t.type === k).length]))

  const filtered = useMemo(() => tasks.filter(t => {
    const s = filter === 'all' ? true : filter === 'pending' ? !t.completed : t.completed
    const tp = typeFilter === 'all' ? true : t.type === typeFilter
    return s && tp
  }), [tasks, filter, typeFilter])

  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(t => {
      const k = t.day ? `Day ${t.day}` : 'Quick Tasks'
      if (!map[k]) map[k] = []
      map[k].push(t)
    })
    return map
  }, [filtered])

  return (
    <Layout>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>⚒️ <span className="gradient-text">AI Learning Engine</span></h1>
            <p>Structured learning loop — Learn → Quiz → Practice → Revise → Next Skill</p>
          </div>
          <button className="btn btn-primary" onClick={() => setAdding(v => !v)}>{adding ? '✕ Cancel' : '+ Add Task'}</button>
        </div>
      </div>

      {/* Learning loop visual */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {FLOW_DAYS.map((d, i) => (
          <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ textAlign: 'center', padding: '10px 14px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', minWidth: 90 }}>
              <div style={{ fontSize: '1.3rem', marginBottom: 3 }}>{d.icon}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)' }}>{d.label}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{d.desc}</div>
            </div>
            {i < 4 && <div style={{ fontSize: '0.75rem', color: 'var(--border-purple)' }}>→</div>}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 18 }}>
        {[{ l:'Pending', v:pending, c:'#F59E0B', i:'⏳' }, { l:'Completed', v:done, c:'#10B981', i:'✅' }, { l:'Done Today', v:todayDone, c:'#8B5CF6', i:'🗓️' }, { l:'Total', v:tasks.length, c:'#6366F1', i:'📋' }].map(s => (
          <div key={s.l} className="stat-card" style={{ background: `${s.c}0d`, border: `1px solid ${s.c}22` }}>
            <div className="stat-icon" style={{ background: `${s.c}18` }}><span style={{ fontSize: '1.2rem' }}>{s.i}</span></div>
            <div><div className="stat-value" style={{ color: s.c }}>{s.v}</div><div className="stat-label">{s.l}</div></div>
          </div>
        ))}
      </div>

      {/* AI Generate */}
      <div className="card card-purple" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: '0.9375rem', marginBottom: 3 }}>🤖 AI Learning Plan Generator</h3>
            <p style={{ fontSize: '0.8rem' }}>Auto-generate a 25-30 day structured plan with Learn → Quiz → Practice → Revise cycles</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select className="select" value={genGoalId} onChange={e => setGenGoalId(e.target.value)} style={{ minWidth: 200 }}>
              <option value="">Select goal...</option>
              {goals.filter(g => !g.completed).map(g => <option key={g._id} value={g._id}>{g.title}</option>)}
            </select>
            <button className="btn btn-primary btn-sm" onClick={generatePlan} disabled={generating || !genGoalId}>
              {generating ? <><div className="spinner" style={{ borderTopColor: 'white', width: 13, height: 13 }} /> Generating...</> : '⚡ Generate Plan'}
            </button>
          </div>
        </div>
        {genError && <div className="alert alert-error" style={{ marginTop: 10 }}>⚠️ {genError}</div>}
      </div>

      {/* Add task form */}
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 16 }}>
            <div className="card" style={{ border: '1px solid var(--border-purple)' }}>
              <h3 style={{ marginBottom: 14, fontSize: '0.9375rem' }}>➕ New Task</h3>
              <form onSubmit={addTask} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input className="input" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Task title..." required autoFocus />
                <div style={{ display: 'flex', gap: 10 }}>
                  <select className="select" value={newPriority} onChange={e => setPriority(e.target.value)} style={{ flex: 1 }}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                  <select className="select" value={newGoalId} onChange={e => setNewGoalId(e.target.value)} style={{ flex: 2 }}>
                    <option value="">No goal</option>
                    {goals.filter(g => !g.completed).map(g => <option key={g._id} value={g._id}>{g.title}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAdding(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={creating}>{creating ? <div className="spinner" style={{ borderTopColor: 'white', width: 13, height: 13 }} /> : 'Add Task'}</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Type filter pills */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 14, flexWrap: 'wrap' }}>
        <button onClick={() => setType('all')} style={{ padding: '5px 12px', borderRadius: 999, border: `1px solid ${typeFilter === 'all' ? 'var(--purple)' : 'var(--border)'}`, background: typeFilter === 'all' ? 'rgba(139,92,246,0.12)' : 'transparent', color: typeFilter === 'all' ? 'var(--purple-light)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'var(--t)', fontFamily: 'inherit' }}>All ({tasks.length})</button>
        {Object.entries(TYPE).map(([k, v]) => (
          <button key={k} onClick={() => setType(t => t === k ? 'all' : k)} style={{ padding: '5px 12px', borderRadius: 999, border: `1px solid ${typeFilter === k ? v.color : 'var(--border)'}`, background: typeFilter === k ? v.bg : 'transparent', color: typeFilter === k ? v.color : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'var(--t)', fontFamily: 'inherit', display: 'flex', gap: 5, alignItems: 'center' }}>
            {v.icon} {v.label} {byType[k] > 0 && <span style={{ opacity: 0.7 }}>({byType[k]})</span>}
          </button>
        ))}
      </div>

      {/* Status tabs */}
      <div className="tab-nav" style={{ marginBottom: 18, width: 'fit-content' }}>
        {[['all','All'],['pending','⏳ Pending'],['completed','✅ Done']].map(([v,l]) => (
          <button key={v} className={`tab-item ${filter===v?'active':''}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {/* Task list */}
      {loading ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 60 }} />)}</div>
      : filtered.length === 0 ? (
        <div className="card"><div className="empty-state"><span className="icon">{filter === 'completed' ? '🎉' : '⚒️'}</span><h3>{filter === 'completed' ? 'Nothing completed yet' : 'No tasks here'}</h3><p>{filter === 'all' ? 'Add tasks manually or generate an AI learning plan' : 'Complete tasks to see them here'}</p>{filter === 'all' && <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setAdding(true)}>+ Add Task</button>}</div></div>
      ) : (
        <AnimatePresence>
          {Object.entries(grouped).map(([day, dayTasks]) => (
            <div key={day} style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--purple-light)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{day}</div>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dayTasks.filter(t => t.completed).length}/{dayTasks.length}</div>
              </div>
              {dayTasks.length > 0 && <div className="progress-bar" style={{ marginBottom: 10, height: 3 }}><div className="progress-fill" style={{ width: `${Math.round(dayTasks.filter(t => t.completed).length / dayTasks.length * 100)}%` }} /></div>}
              <AnimatePresence>
                {dayTasks.map(t => {
                  const meta = TYPE[t.type] || { icon: '📝', color: '#64748B', bg: 'rgba(100,116,139,0.08)', label: 'Task' }
                  const isLong = t.description && t.description.length > 200
                  return (
                    <ExpandableTask key={t._id} t={t} meta={meta} isLong={isLong} onToggle={toggle} onDelete={del} />
                  )
                })}
              </AnimatePresence>
            </div>
          ))}
        </AnimatePresence>
      )}

      {/* Achievement Effects */}
      <AnimatePresence>
        {bursts.map(b => <ConfettiBurst key={b.id} x={b.x} y={b.y} onDone={() => setBursts(p => p.filter(x => x.id !== b.id))} />)}
        {xpBursts.map(b => <XPBurst key={b.id} amount={b.amount} x={b.x} y={b.y} onDone={() => setXpBursts(p => p.filter(x => x.id !== b.id))} />)}
        {skillCard && <SkillMasteredCard key="skill" skill={skillCard.skill} xp={skillCard.xp} onClose={() => setSkillCard(null)} />}
      </AnimatePresence>
    </Layout>
  )
}
