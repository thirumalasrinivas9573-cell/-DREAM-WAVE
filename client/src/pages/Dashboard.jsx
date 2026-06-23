import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { goalApi, taskApi, dailyApi } from '../services/api'
import CountUp from '../components/animations/CountUp'
import NeuralBg from '../components/animations/NeuralBg'
import AIOrb from '../components/animations/AIOrb'
import { StreakFlame, XPRing } from '../components/Gamification'

const stagger = { animate: { transition: { staggerChildren: 0.06 } } }
const fadeUp  = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0, transition: { duration: 0.32 } } }

const QUICK = [
  { to: '/goals',     icon: '🎯', label: 'Goals',        color: '#8B5CF6', desc: 'Set & track targets'   },
  { to: '/roadmap',   icon: '🗺️', label: 'Roadmap',      color: '#6366F1', desc: 'Career intelligence'   },
  { to: '/learn',     icon: '🎓', label: 'AI Studio',     color: '#A855F7', desc: 'Cinematic lessons'     },
  { to: '/tasks',     icon: '⚒️', label: 'Learning',      color: '#10B981', desc: 'Daily skill engine'    },
  { to: '/mentor',    icon: '🤖', label: 'AI Mentor',     color: '#C084FC', desc: 'Personal guidance'     },
  { to: '/reports',   icon: '📊', label: 'R&D Reports',   color: '#818CF8', desc: 'Deep career research'  },
  { to: '/resume',    icon: '📄', label: 'Resume',        color: '#A78BFA', desc: 'ATS-friendly builder'  },
  { to: '/community', icon: '💬', label: 'Community',     color: '#9333EA', desc: 'Learn together'        },
]

const JOURNEY = [
  { icon: '🎯', label: 'Set Goal',     route: '/goals',   status: 'done'    },
  { icon: '🗺️', label: 'Roadmap',      route: '/roadmap', status: 'active'  },
  { icon: '🎓', label: 'Learn',        route: '/learn',   status: 'pending' },
  { icon: '❓', label: 'Quiz',         route: '/tasks',   status: 'pending' },
  { icon: '⚒️', label: 'Practice',    route: '/tasks',   status: 'pending' },
  { icon: '📊', label: 'Assess',       route: '/reports', status: 'pending' },
  { icon: '📄', label: 'Resume',       route: '/resume',  status: 'pending' },
  { icon: '🚀', label: 'Career',       route: '/roadmap', status: 'pending' },
]

function AIInsightCard({ insight, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        padding: '12px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        background: `${insight.color || '#8B5CF6'}18`,
        border: `1px solid ${insight.color || '#8B5CF6'}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.95rem',
      }}>
        {insight.icon}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.845rem', color: 'var(--text-primary)', marginBottom: 2 }}>
          {insight.title}
        </div>
        <p style={{ fontSize: '0.78rem', lineHeight: 1.55 }}>{insight.body}</p>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [goals, setGoals]       = useState([])
  const [tasks, setTasks]       = useState([])
  const [daily, setDaily]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [orbState, setOrbState] = useState('idle')

  useEffect(() => {
    Promise.all([goalApi.getAll(), taskApi.getAll()])
      .then(([g, t]) => {
        setGoals(g.data.goals || [])
        setTasks(t.data.tasks || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    // Load daily insight
    dailyApi.get()
      .then(r => setDaily(r.data))
      .catch(() => {})
  }, [])

  const activeGoals  = goals.filter(g => !g.completed)
  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 6)
  const doneTasks    = tasks.filter(t => t.completed)
  const todayDone    = tasks.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === new Date().toDateString()).length

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const xp    = user?.credits || 0
  const level = user?.level || 1
  const streak = user?.streak || 0

  const STATS = [
    { icon: '🎯', label: 'Active Goals',  value: activeGoals.length,  color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',  to: '/goals'  },
    { icon: '⚒️', label: 'Tasks Pending', value: pendingTasks.length, color: '#10B981', bg: 'rgba(16,185,129,0.1)',  to: '/tasks'  },
    { icon: '✅', label: 'Completed',      value: doneTasks.length,    color: '#A855F7', bg: 'rgba(168,85,247,0.1)',  to: '/tasks'  },
    { icon: '📖', label: 'Done Today',     value: todayDone,           color: '#6366F1', bg: 'rgba(99,102,241,0.1)',  to: '/tasks'  },
  ]

  const aiInsights = [
    daily?.advice && {
      icon: '💡', color: '#F59E0B',
      title: "Today's AI Insight",
      body: daily.advice?.slice(0, 120) + (daily.advice?.length > 120 ? '…' : ''),
    },
    activeGoals.length > 0 && {
      icon: '🎯', color: '#8B5CF6',
      title: 'Current Focus',
      body: `You have ${activeGoals.length} active goal${activeGoals.length !== 1 ? 's' : ''}. Your top goal: "${activeGoals[0]?.title}".`,
    },
    pendingTasks.length > 0 && {
      icon: '⚒️', color: '#10B981',
      title: 'Next Action',
      body: `Up next: "${pendingTasks[0]?.title}" — ${pendingTasks[0]?.type || 'task'} type.`,
    },
    streak >= 3 && {
      icon: '🔥', color: '#F59E0B',
      title: 'Streak Milestone',
      body: `${streak}-day learning streak! Keep going to unlock the "Consistent Learner" achievement.`,
    },
  ].filter(Boolean).slice(0, 3)

  return (
    <Layout>
      {/* ── AI Command Center Hero ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 28, position: 'relative', borderRadius: 'var(--r-xl)',
          overflow: 'hidden', padding: '28px 28px 24px',
          background: 'rgba(13,13,23,0.85)',
          border: '1px solid var(--border-purple)',
          boxShadow: '0 0 60px rgba(139,92,246,0.08)',
        }}
      >
        <NeuralBg nodeCount={40} color="#8B5CF6" opacity={0.5} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              onMouseEnter={() => setOrbState('responding')}
              onMouseLeave={() => setOrbState('idle')}
            >
              <AIOrb state={orbState} size={64} color="#8B5CF6" />
            </div>
            <div>
              <h1 style={{ marginBottom: 4 }}>
                {greeting},{' '}
                <span className="gradient-text">{user?.name?.split(' ')[0]} 👋</span>
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Your AI-powered learning universe — everything connected
              </p>
            </div>
          </div>
          {/* Level + XP ring + Streak */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <StreakFlame streak={streak} size={44} />
            <XPRing xp={xp} level={level} size={64} color="#8B5CF6" />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{xp} XP</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Level {level}</div>
            </div>
          </div>
        </div>
        {/* Learning Journey Bar */}
        <div style={{
          position: 'relative', zIndex: 1, marginTop: 20, paddingTop: 18,
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Learning Journey
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
            {JOURNEY.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <Link to={step.route} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: step.status === 'done'
                        ? 'linear-gradient(135deg, #10B981, #34D399)'
                        : step.status === 'active'
                          ? 'linear-gradient(135deg, #8B5CF6, #C084FC)'
                          : 'rgba(255,255,255,0.07)',
                      border: step.status === 'active' ? '2px solid #C084FC' : '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.95rem',
                      boxShadow: step.status === 'active' ? '0 0 16px rgba(139,92,246,0.4)' : 'none',
                      position: 'relative',
                    }}>
                      {step.status === 'done' ? '✓' : step.icon}
                      {step.status === 'active' && (
                        <motion.div
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{
                            position: 'absolute', inset: -4,
                            borderRadius: '50%', border: '2px solid #8B5CF6',
                            pointerEvents: 'none',
                          }}
                        />
                      )}
                    </div>
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 600,
                      color: step.status === 'done'
                        ? '#34D399'
                        : step.status === 'active'
                          ? '#C084FC'
                          : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                    }}>
                      {step.label}
                    </span>
                  </motion.div>
                </Link>
                {i < JOURNEY.length - 1 && (
                  <div style={{
                    width: 28, height: 1.5, flexShrink: 0, margin: '0 2px',
                    background: i === 0
                      ? 'linear-gradient(90deg, #10B981, #8B5CF6)'
                      : 'rgba(255,255,255,0.08)',
                    marginBottom: 20,
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Stats row ────────────────────────────────────────────────── */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid-4" style={{ marginBottom: 24 }}>
        {STATS.map(s => (
          <motion.div key={s.label} variants={fadeUp}>
            <Link to={s.to} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ y: -5, boxShadow: `0 12px 32px ${s.color}30` }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <div className="stat-card" style={{
                  background: `linear-gradient(135deg, ${s.bg}, rgba(13,13,23,0.8))`,
                  border: `1px solid ${s.color}30`, cursor: 'pointer', height: '100%',
                }}>
                  <div className="stat-icon" style={{ background: s.bg }}>
                    <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
                  </div>
                  <div>
                    <div className="stat-value" style={{ color: s.color }}>
                      {loading ? '--' : typeof s.value === 'number' ? <CountUp end={s.value} duration={1.2} /> : s.value}
                    </div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Main grid ────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 18, marginBottom: 24 }}>

        {/* Active Goals */}
        <motion.div variants={fadeUp} initial="initial" animate="animate">
          <div className="card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>🎯 Active Goals</h3>
              <Link to="/goals" className="btn btn-secondary btn-sm">View all</Link>
            </div>
            {loading
              ? [...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 10 }} />)
              : activeGoals.length === 0
                ? (
                  <div className="empty-state" style={{ padding: '24px 0' }}>
                    <span className="icon">🎯</span>
                    <p style={{ fontSize: '0.84rem' }}>No active goals yet</p>
                    <Link to="/goals" className="btn btn-primary btn-sm" style={{ marginTop: 10, textDecoration: 'none' }}>Create Goal</Link>
                  </div>
                )
                : activeGoals.slice(0, 4).map(g => (
                  <div key={g._id} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.855rem', fontWeight: 600, color: 'var(--text-primary)' }}>{g.title}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--purple-light)' }}>{g.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${g.progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))
            }
          </div>
        </motion.div>

        {/* Learning Queue */}
        <motion.div variants={fadeUp} initial="initial" animate="animate">
          <div className="card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>⚒️ Learning Queue</h3>
              <Link to="/tasks" className="btn btn-secondary btn-sm">View all</Link>
            </div>
            {loading
              ? [...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 38, marginBottom: 8 }} />)
              : pendingTasks.length === 0
                ? (
                  <div className="empty-state" style={{ padding: '24px 0' }}>
                    <span className="icon">✅</span>
                    <p style={{ fontSize: '0.84rem' }}>All tasks complete!</p>
                    <Link to="/tasks" className="btn btn-primary btn-sm" style={{ marginTop: 10, textDecoration: 'none' }}>Add Task</Link>
                  </div>
                )
                : pendingTasks.map((t, i) => {
                  const typeColors = { learn: '#6366F1', quiz: '#F59E0B', practice: '#10B981', revise: '#A855F7' }
                  const dot = typeColors[t.type] || '#64748B'
                  return (
                    <Link to="/tasks" key={t._id} style={{ textDecoration: 'none' }}>
                      <motion.div
                        whileHover={{ x: 4, background: 'rgba(139,92,246,0.04)' }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 0', borderBottom: i < pendingTasks.length - 1 ? '1px solid var(--border)' : 'none',
                          borderRadius: 8, cursor: 'pointer', transition: 'var(--t)',
                        }}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.845rem', flex: 1, color: 'var(--text-primary)' }}>{t.title}</span>
                        {t.type && <span className="badge badge-purple" style={{ fontSize: '0.67rem', textTransform: 'capitalize' }}>{t.type}</span>}
                      </motion.div>
                    </Link>
                  )
                })
            }
          </div>
        </motion.div>

        {/* AI Insights Panel */}
        <motion.div variants={fadeUp} initial="initial" animate="animate">
          <div className="card" style={{ height: '100%', background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(13,13,23,0.9))', border: '1px solid var(--border-purple)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <AIOrb state="idle" size={32} color="#8B5CF6" />
              <h3 style={{ fontSize: '0.9rem' }}>AI Insights</h3>
            </div>
            {aiInsights.length === 0
              ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Complete tasks to unlock AI insights.
                </div>
              )
              : aiInsights.map((ins, i) => (
                <AIInsightCard key={i} insight={ins} index={i} />
              ))
            }
            <div style={{ marginTop: 14 }}>
              <Link to="/mentor" className="btn btn-secondary btn-sm" style={{ width: '100%', textDecoration: 'none', justifyContent: 'center' }}>
                🤖 Ask AI Mentor
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Quick Access ──────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <div className="card">
          <h3 style={{ marginBottom: 18 }}>🚀 Quick Access</h3>
          <div className="grid-4">
            {QUICK.map((q, i) => (
              <motion.div key={q.to} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.045 } }}>
                <Link to={q.to} style={{ textDecoration: 'none', display: 'block' }}>
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="card card-sm"
                    style={{
                      textAlign: 'center',
                      background: `${q.color}0d`,
                      border: `1px solid ${q.color}20`,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '1.7rem', marginBottom: 6 }}>{q.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.845rem', color: 'var(--text-primary)', marginBottom: 2 }}>{q.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{q.desc}</div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </Layout>
  )
}
