import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { goalApi, roadmapApi } from '../services/api'
import SkillGalaxy from '../components/SkillGalaxy'

const TABS = [
  { id: 'overview',   label: 'Overview',        icon: '📋' },
  { id: 'skills',     label: 'Skill Galaxy',     icon: '🌌' },
  { id: 'steps',      label: 'Journey',          icon: '🗺️' },
  { id: 'courses',    label: 'Courses',          icon: '🎓' },
  { id: 'projects',   label: 'Projects',         icon: '⚒️' },
  { id: 'colleges',   label: 'Colleges',         icon: '🏛️' },
  { id: 'exams',      label: 'Exams',            icon: '📝' },
  { id: 'timeline',   label: 'Timeline',         icon: '📅' },
  { id: 'salary',     label: 'Salary',           icon: '💰' },
  { id: 'companies',  label: 'Companies',        icon: '🏢' },
  { id: 'alternatives', label: 'Alt Careers',   icon: '🔄' },
  { id: 'future',     label: 'Future Trends',    icon: '🔮' },
  { id: 'tips',       label: 'Insider Tips',     icon: '💡' },
]

function SectionCard({ title, icon, children, color = 'var(--purple)' }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{icon}</div>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function Roadmap() {
  const [searchParams] = useSearchParams()
  const urlGoalId = searchParams.get('goalId')
  const [goals, setGoals] = useState([])
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [tab, setTab] = useState('overview')
  const [error, setError] = useState('')

  useEffect(() => {
    goalApi.getAll().then(r => {
      const g = r.data.goals || []
      setGoals(g)
      const target = urlGoalId ? g.find(x => x._id === urlGoalId) : null
      setSelectedGoal(target || (g.length > 0 ? g[0] : null))
    }).catch(() => {})
  }, [urlGoalId])

  useEffect(() => {
    if (!selectedGoal) return
    setLoading(true); setRoadmap(null); setError('')
    roadmapApi.get(selectedGoal._id)
      .then(r => setRoadmap(r.data.roadmap?.data || null))
      .catch(() => setRoadmap(null))
      .finally(() => setLoading(false))
  }, [selectedGoal])

  const generate = async () => {
    if (!selectedGoal) return
    setGenerating(true); setError('')
    try {
      const { data } = await roadmapApi.generate({
        goalId: selectedGoal._id,
        goalTitle: selectedGoal.title,
        category: selectedGoal.category,
      })
      setRoadmap(data.roadmap?.data || null)
      setTab('overview')
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed. Please try again.')
    } finally { setGenerating(false) }
  }

  const rd = roadmap

  return (
    <Layout>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1><span className="gradient-text">Career Intelligence</span> Roadmap</h1>
            <p>AI-powered deep career analysis — skills, colleges, salary, trends, and more</p>
          </div>
          {rd && <button className="btn btn-primary btn-sm" onClick={generate} disabled={generating}>{generating ? <><div className="spinner" style={{ borderTopColor: 'white' }} /> Regenerating...</> : '🔄 Regenerate'}</button>}
        </div>
      </div>

      {/* Goal selector + generate */}
      <div className="card" style={{ marginBottom: 20, background: 'rgba(13,13,23,0.8)', border: '1px solid var(--border-purple)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.845rem', color: 'var(--text-muted)', flexShrink: 0 }}>Goal:</span>
          <select className="select" value={selectedGoal?._id || ''} onChange={e => setSelectedGoal(goals.find(g => g._id === e.target.value))} style={{ flex: 1, maxWidth: 380 }}>
            {goals.length === 0 && <option value="">No goals — create one first</option>}
            {goals.map(g => <option key={g._id} value={g._id}>{g.title} ({g.category})</option>)}
          </select>
          <button className="btn btn-primary" onClick={generate} disabled={generating || !selectedGoal} style={{ flexShrink: 0 }}>
            {generating ? <><div className="spinner" style={{ borderTopColor: 'white' }} /> Building Intelligence...</> : '🧠 Generate Career Intelligence'}
          </button>
        </div>
        {goals.length === 0 && <div style={{ marginTop: 10 }}><Link to="/goals" className="btn btn-secondary btn-sm">+ Create a Goal first</Link></div>}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
      {generating && (
        <div className="card card-purple" style={{ marginBottom: 16, textAlign: 'center', padding: '32px' }}>
          <div className="spinner spinner-xl" style={{ margin: '0 auto 16px' }} />
          <h3 className="gradient-text" style={{ marginBottom: 8 }}>Building your Career Intelligence Engine...</h3>
          <p>Analyzing skills, colleges, exams, salary data, industry trends, and creating your personalized roadmap. This takes 30-60 seconds.</p>
        </div>
      )}

      {loading && <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80 }} />)}</div>}

      {!loading && !rd && !generating && selectedGoal && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', border: '1px dashed var(--border-purple)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🧠</div>
          <h2 className="gradient-text" style={{ marginBottom: 8 }}>No roadmap yet for this goal</h2>
          <p style={{ marginBottom: 20 }}>Click "Generate Career Intelligence" to build a comprehensive AI roadmap with skills, colleges, salary data, and career paths.</p>
          <button className="btn btn-primary btn-lg" onClick={generate}>🚀 Generate Career Intelligence Now</button>
        </div>
      )}

      {rd && !generating && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Tab navigation */}
          <div style={{ overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
            <div className="tab-nav" style={{ width: 'max-content', gap: 2 }}>
              {TABS.map(t => (
                <button key={t.id} className={`tab-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>

              {/* OVERVIEW */}
              {tab === 'overview' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div className="card card-purple">
                      <div style={{ fontSize: '0.73rem', color: 'var(--purple-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Where You Are Now</div>
                      <p style={{ color: 'var(--text-primary)', lineHeight: 1.75 }}>{rd.currentStage || 'Analyzing your starting point...'}</p>
                    </div>
                    <div className="card" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <div style={{ fontSize: '0.73rem', color: '#34D399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Career Purpose</div>
                      <p style={{ color: 'var(--text-primary)', lineHeight: 1.75 }}>{rd.overview?.slice(0, 200) || 'Loading overview...'}</p>
                    </div>
                  </div>
                  <SectionCard title="Full Career Overview" icon="📋">
                    <p style={{ lineHeight: 1.85, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>{rd.overview}</p>
                  </SectionCard>
                  {rd.careerPaths?.length > 0 && (
                    <SectionCard title="Career Paths This Unlocks" icon="🚀">
                      <div className="grid-2">
                        {rd.careerPaths.map((c, i) => (
                          <div key={i} className="card card-sm card-lift" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid var(--border-purple)' }}>
                            <div style={{ fontWeight: 600, marginBottom: 5 }}>{c.title}</div>
                            <p style={{ fontSize: '0.82rem', marginBottom: 8 }}>{c.description}</p>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <span className="badge badge-green">{c.avgSalary}</span>
                              <span className={`badge ${c.demand === 'High' ? 'badge-red' : 'badge-yellow'}`}>{c.demand} Demand</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}
                  {rd.milestones?.length > 0 && (
                    <SectionCard title="Key Milestones" icon="🏆">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {rd.milestones.map((m, i) => (
                          <div key={i} style={{ display: 'flex', gap: 14 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--purple), var(--purple-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0, color: 'white' }}>{i + 1}</div>
                            <div>
                              <div style={{ fontWeight: 600, marginBottom: 2 }}>{m.title}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--purple-light)', marginBottom: 3 }}>⏱ {m.timeframe}</div>
                              <p style={{ fontSize: '0.84rem' }}>{m.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}
                </div>
              )}

              {/* SKILL GALAXY */}
              {tab === 'skills' && (
                <div>
                  <div className="card card-purple" style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <h2 style={{ marginBottom: 4 }}>🌌 Interactive Skill Galaxy</h2>
                        <p style={{ fontSize: '0.84rem' }}>Click any skill node to explore. Complete skills glow green — your current focus pulses blue.</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span className="badge badge-green">{(rd.skills || []).length} Skills Total</span>
                      </div>
                    </div>
                  </div>
                  {rd.skills?.length > 0
                    ? <SkillGalaxy skills={rd.skills} currentSkillName={rd.currentSkillFocus} />
                    : <div className="empty-state"><span className="icon">🌌</span><p>Regenerate roadmap to see the skill galaxy</p></div>
                  }
                  {/* Skill list below galaxy */}
                  <div style={{ marginTop: 24 }}>
                    {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(level => {
                      const levelSkills = (rd.skills || []).filter(s => s.level === level)
                      if (!levelSkills.length) return null
                      const colors = { Beginner: '#6366F1', Intermediate: '#A855F7', Advanced: '#EC4899', Expert: '#F59E0B' }
                      const c = colors[level]
                      return (
                        <SectionCard key={level} title={`${level} Skills`} icon={level === 'Beginner' ? '🌱' : level === 'Intermediate' ? '🌿' : level === 'Advanced' ? '🌳' : '⭐'} color={c}>
                          <div className="grid-2">
                            {levelSkills.sort((a, b) => (a.order || 0) - (b.order || 0)).map((s, i) => (
                              <div key={i} className="card card-sm" style={{ background: `${c}08`, border: `1px solid ${c}20` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>#{s.order || i + 1} {s.name}</span>
                                  <span className="badge" style={{ background: `${c}20`, color: c, border: `1px solid ${c}30`, fontSize: '0.68rem' }}>{s.priority}</span>
                                </div>
                                <div className="progress-bar" style={{ marginBottom: 6 }}>
                                  <div style={{ height: '100%', borderRadius: 999, background: c, width: level === 'Beginner' ? '25%' : level === 'Intermediate' ? '50%' : level === 'Advanced' ? '75%' : '100%', transition: 'width 0.8s ease' }} />
                                </div>
                                {s.resources && <p style={{ fontSize: '0.78rem' }}>📖 {s.resources}</p>}
                              </div>
                            ))}
                          </div>
                        </SectionCard>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* JOURNEY / STEPS */}
              {tab === 'steps' && (
                <div>
                  {(rd.nextSteps || []).map((s, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: i * 0.08, type: 'spring', stiffness: 200 } }}
                      style={{ display: 'flex', gap: 16, marginBottom: 16 }}
                    >
                      <div className="step-connector">
                        <motion.div
                          className={`step-dot ${i === 0 ? 'node-current' : ''}`}
                          style={{ marginTop: 18, position: 'relative' }}
                          animate={i === 0 ? { scale: [1, 1.15, 1], boxShadow: ['0 0 0 0 rgba(139,92,246,0.5)', '0 0 0 8px rgba(139,92,246,0)', '0 0 0 0 rgba(139,92,246,0.5)'] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        {i < (rd.nextSteps?.length || 0) - 1 && (
                          <motion.div
                            className="step-line"
                            initial={{ scaleY: 0, originY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: i * 0.08 + 0.2, duration: 0.4 }}
                          />
                        )}
                      </div>
                      <div className="card" style={{ flex: 1, marginBottom: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              style={{ width: 30, height: 30, borderRadius: 8, background: i === 0 ? 'linear-gradient(135deg,var(--purple),var(--purple-mid))' : 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: 'white', flexShrink: 0 }}
                            >{s.step || i + 1}</motion.div>
                            <h3 style={{ fontSize: '0.9375rem' }}>{s.title}</h3>
                          </div>
                          {s.duration && <span className="badge badge-purple">⏱ {s.duration}</span>}
                        </div>
                        <p style={{ fontSize: '0.875rem', lineHeight: 1.72 }}>{s.description}</p>
                      </div>
                    </motion.div>
                  ))}
                  {(!rd.nextSteps || rd.nextSteps.length === 0) && <div className="empty-state"><span className="icon">🗺️</span><p>No steps available yet</p></div>}
                </div>
              )}

              {/* COURSES */}
              {tab === 'courses' && (
                <div className="grid-2">
                  {(rd.courses || []).map((c, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}>
                      <div className="card card-lift" style={{ height: '100%' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🎓</div>
                          <div><h3 style={{ fontSize: '0.9rem', marginBottom: 3 }}>{c.name}</h3><span style={{ fontSize: '0.78rem', color: 'var(--purple-light)' }}>{c.platform}</span></div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                          <span className="badge badge-green">{c.cost}</span>
                          {c.duration && <span className="badge badge-gray">⏱ {c.duration}</span>}
                        </div>
                        {c.why && <p style={{ fontSize: '0.8rem' }}>{c.why}</p>}
                      </div>
                    </motion.div>
                  ))}
                  {(!rd.courses || rd.courses.length === 0) && <div className="empty-state" style={{ gridColumn: '1/-1' }}><span className="icon">🎓</span><p>No courses data yet</p></div>}
                </div>
              )}

              {/* PROJECTS */}
              {tab === 'projects' && (
                <div>
                  {rd.projects?.length > 0 ? rd.projects.map((p, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.06 } }}>
                      <div className="card" style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#10B981,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: '0.82rem', flexShrink: 0 }}>P{i + 1}</div>
                            <h3 style={{ fontSize: '0.9375rem' }}>{p.title || p.name}</h3>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {p.difficulty && <span className={`badge ${p.difficulty === 'Beginner' ? 'badge-green' : p.difficulty === 'Intermediate' ? 'badge-yellow' : 'badge-red'}`}>{p.difficulty}</span>}
                            {p.duration && <span className="badge badge-purple">⏱ {p.duration}</span>}
                          </div>
                        </div>
                        {p.description && <p style={{ fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 10 }}>{p.description}</p>}
                        {p.skills?.length > 0 && <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>{p.skills.map((s, j) => <span key={j} className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{s}</span>)}</div>}
                        {p.outcome && <p style={{ fontSize: '0.8rem', color: '#34D399' }}>🎯 {p.outcome}</p>}
                      </div>
                    </motion.div>
                  )) : (
                    <SectionCard title="Portfolio Project Ideas" icon="💡">
                      <p style={{ marginBottom: 14 }}>Build these projects based on your roadmap steps to create a strong portfolio:</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(rd.nextSteps || []).slice(0, 5).map((step, i) => (
                          <div key={i} className="card card-sm" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>Project {i + 1}: Apply "{step.title}"</div>
                            <p style={{ fontSize: '0.82rem' }}>Build a real project using concepts from this step. Duration: {step.duration || '2-4 weeks'}.</p>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}
                </div>
              )}

              {/* COLLEGES */}
              {tab === 'colleges' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(rd.colleges || []).map((c, i) => (
                    <div key={i} className="card card-lift">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <h3 style={{ fontSize: '1rem', marginBottom: 6 }}>{c.name}</h3>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <span className={`badge ${c.type === 'Government' ? 'badge-green' : 'badge-blue'}`}>{c.type}</span>
                            <span className="badge badge-gray">📍 {c.location}</span>
                            {c.ranking && <span className="badge badge-yellow">🏆 {c.ranking}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {c.fees && <div style={{ fontWeight: 800, color: '#34D399', fontSize: '0.95rem' }}>{c.fees}/yr</div>}
                        </div>
                      </div>
                      {c.programs && <p style={{ marginTop: 8, fontSize: '0.82rem' }}>🎓 {c.programs}</p>}
                      {c.entranceExam && <p style={{ marginTop: 4, fontSize: '0.8rem', color: 'var(--purple-light)' }}>📝 Exam: {c.entranceExam}</p>}
                    </div>
                  ))}
                  {(!rd.colleges || rd.colleges.length === 0) && <div className="empty-state"><span className="icon">🏛️</span><p>No college data yet. Regenerate roadmap.</p></div>}
                </div>
              )}

              {/* EXAMS */}
              {tab === 'exams' && (
                <div className="grid-2">
                  {(rd.exams || []).map((e, i) => (
                    <div key={i} className="card card-lift">
                      <h3 style={{ fontSize: '0.9375rem', marginBottom: 8 }}>{e.name}</h3>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span className="badge badge-blue">{e.type}</span>
                        <span className={`badge ${e.importance === 'High' ? 'badge-red' : 'badge-yellow'}`}>{e.importance}</span>
                        <span className="badge badge-gray">📅 {e.frequency}</span>
                      </div>
                      {e.eligibility && <p style={{ fontSize: '0.8rem', marginBottom: 5 }}>✅ {e.eligibility}</p>}
                      {e.prepTime && <p style={{ fontSize: '0.8rem', color: 'var(--purple-light)' }}>⏱ Prep: {e.prepTime}</p>}
                      {e.description && <p style={{ fontSize: '0.8rem', marginTop: 6 }}>{e.description}</p>}
                    </div>
                  ))}
                  {(!rd.exams || rd.exams.length === 0) && <div className="empty-state" style={{ gridColumn: '1/-1' }}><span className="icon">📝</span><p>No exam data yet</p></div>}
                </div>
              )}

              {/* TIMELINE */}
              {tab === 'timeline' && (
                <div>
                  {(rd.timeline || []).map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 4 }}>
                      <div className="step-connector">
                        <div className="step-dot" style={{ marginTop: 18 }} />
                        {i < (rd.timeline?.length || 0) - 1 && <div className="step-line" />}
                      </div>
                      <div className="card card-sm" style={{ flex: 1, marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                          <span className="badge badge-purple" style={{ fontSize: '0.73rem' }}>📅 {t.period}</span>
                          <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>{t.focus}</span>
                        </div>
                        <p style={{ fontSize: '0.845rem', marginBottom: t.activities ? 8 : 0 }}>{t.goal}</p>
                        {t.activities?.length > 0 && (
                          <ul style={{ paddingLeft: 16 }}>
                            {t.activities.map((a, j) => <li key={j} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>{a}</li>)}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!rd.timeline || rd.timeline.length === 0) && <div className="empty-state"><span className="icon">📅</span><p>No timeline data yet</p></div>}
                </div>
              )}

              {/* SALARY */}
              {tab === 'salary' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {(rd.salaryProgression || []).map((s, i) => {
                    const pct = Math.min(100, 20 + i * 20)
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.1 } }}>
                        <div className="card" style={{ background: `rgba(16,185,129,${0.04 + i * 0.025})`, border: '1px solid rgba(16,185,129,0.15)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: 3 }}>{s.stage}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⏱ {s.experience}</div>
                              {s.roles && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 3 }}>💼 {s.roles}</div>}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#10B981' }}>{s.salary}</div>
                            </div>
                          </div>
                          <div className="progress-bar"><div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#10B981,#34D399)', width: `${pct}%`, transition: 'width 0.8s ease' }} /></div>
                        </div>
                      </motion.div>
                    )
                  })}
                  {(!rd.salaryProgression || rd.salaryProgression.length === 0) && <div className="empty-state"><span className="icon">💰</span><p>No salary data yet</p></div>}
                </div>
              )}

              {/* COMPANIES */}
              {tab === 'companies' && (
                <div>
                  {rd.topCompanies?.length > 0 ? (
                    <div className="grid-2">
                      {rd.topCompanies.map((c, i) => (
                        <div key={i} className="card card-sm card-lift">
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏢</div>
                            <div><div style={{ fontWeight: 600 }}>{c.name || c}</div>{c.type && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.type}</div>}</div>
                          </div>
                          {c.salary && <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>{c.salary}</span>}
                          {c.description && <p style={{ fontSize: '0.8rem', marginTop: 6 }}>{c.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <SectionCard title="Top Companies in This Field" icon="🏢">
                      <p style={{ marginBottom: 14 }}>Based on your career path, these types of companies hire professionals in this domain:</p>
                      <div className="grid-2">
                        {['Product Companies (FAANG/MNCs)', 'Indian IT Giants (TCS, Infosys, Wipro)', 'Startups & Scale-ups', 'Government & PSU Organizations', 'Research Institutions', 'Consulting Firms'].map((c, i) => (
                          <div key={i} className="card card-sm" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid var(--border-purple)' }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span style={{ fontSize: '1.1rem' }}>🏢</span>
                              <span style={{ fontSize: '0.845rem', fontWeight: 500 }}>{c}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}
                </div>
              )}

              {/* ALTERNATIVE CAREERS */}
              {tab === 'alternatives' && (
                <div>
                  {rd.careerPaths?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div className="card card-purple" style={{ marginBottom: 4 }}>
                        <p style={{ color: 'var(--text-primary)' }}>These alternative career paths are closely related to your goal and leverage similar skills. Each offers unique opportunities.</p>
                      </div>
                      {rd.careerPaths.map((c, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.07 } }}>
                          <div className="card card-lift">
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                              <h3 style={{ fontSize: '1rem' }}>{c.title}</h3>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <span className="badge badge-green">{c.avgSalary}</span>
                                <span className={`badge ${c.demand === 'High' ? 'badge-red' : 'badge-yellow'}`}>{c.demand} Demand</span>
                              </div>
                            </div>
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>{c.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : <div className="empty-state"><span className="icon">🔄</span><p>Alternative careers data not available. Try regenerating.</p></div>}
                </div>
              )}

              {/* FUTURE TRENDS */}
              {tab === 'future' && (
                <div>
                  {rd.certifications?.length > 0 && (
                    <SectionCard title="Valuable Certifications" icon="🏅">
                      <div className="grid-2">
                        {rd.certifications.map((c, i) => (
                          <div key={i} className="card card-sm card-lift">
                            <div style={{ fontWeight: 600, marginBottom: 5 }}>{c.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>{c.issuer}</div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: c.description ? 6 : 0 }}>
                              <span className={`badge ${c.value === 'High' ? 'badge-green' : 'badge-yellow'}`}>{c.value} Value</span>
                              <span className="badge badge-gray">{c.cost}</span>
                            </div>
                            {c.description && <p style={{ fontSize: '0.78rem' }}>{c.description}</p>}
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}
                  <SectionCard title="Future of This Career (2025-2035)" icon="🔮">
                    <div className="grid-2">
                      {['AI & Automation Impact', 'Emerging Technologies', 'Remote Work Trends', 'Global Opportunities', 'Skill Evolution', 'Industry Disruptions'].map((t, i) => (
                        <div key={i} className="card card-sm" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid var(--border-purple)' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>🔮 {t}</div>
                          <p style={{ fontSize: '0.8rem' }}>Regenerate with a more specific goal to get detailed future trend analysis for this career path.</p>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* INSIDER TIPS */}
              {tab === 'tips' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {(rd.tips || []).length === 0 ? <div className="empty-state"><span className="icon">💡</span><p>No tips data yet. Regenerate your roadmap.</p></div> :
                    (rd.tips || []).map((tip, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.07 } }}>
                        <div className="card card-lift" style={{ display: 'flex', gap: 14, background: 'rgba(139,92,246,0.05)', border: '1px solid var(--border-purple)' }}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,var(--purple),var(--purple-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0, color: 'white' }}>💡</div>
                          <p style={{ fontSize: '0.9rem', lineHeight: 1.72, color: 'var(--text-primary)' }}>{tip}</p>
                        </div>
                      </motion.div>
                    ))
                  }
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </Layout>
  )
}
