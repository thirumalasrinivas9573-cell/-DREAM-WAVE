import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../components/Layout'
import { reportApi } from '../services/api'
import MessageRenderer from '../components/MessageRenderer'
import { AnimatedStat, HBar } from '../components/AnimatedChart'

const SECTIONS = [
  { key:'executiveSummary',    icon:'📋', label:'Executive Summary',         color:'#8B5CF6', new:true },
  { key:'industryOverview',    icon:'🏭', label:'Industry Overview',         color:'#6366F1', new:true },
  { key:'marketSize',          icon:'📊', label:'Market Size & Growth',      color:'#10B981', new:true },
  { key:'futureDemand',        icon:'🔮', label:'Future Demand (5-10yr)',    color:'#A855F7', new:true },
  { key:'globalTrends',        icon:'🌍', label:'Global Trends',             color:'#06B6D4', new:true },
  { key:'indiaTrends',         icon:'🇮🇳', label:'India Market Trends',      color:'#F59E0B', new:true },
  { key:'requiredSkills',      icon:'🛠️', label:'Required Skills Analysis',  color:'#8B5CF6', new:true },
  { key:'learningRoadmap',     icon:'🎓', label:'Learning Roadmap',          color:'#6366F1', new:true },
  { key:'careerOpportunities', icon:'💼', label:'Career Opportunities',      color:'#10B981', new:true },
  { key:'salaryAnalysis',      icon:'💰', label:'Salary Analysis',           color:'#F59E0B', new:true },
  { key:'topCompanies',        icon:'🏢', label:'Top Companies',             color:'#06B6D4', new:true },
  { key:'realProjects',        icon:'⚒️', label:'Real Projects to Build',    color:'#A855F7', new:true },
  { key:'emergingTechnologies',icon:'🚀', label:'Emerging Technologies',     color:'#8B5CF6', new:true },
  { key:'challenges',          icon:'⚠️', label:'Challenges & Risks',        color:'#EF4444', new:true },
  { key:'recommendations',     icon:'🎯', label:'Expert Recommendations',    color:'#10B981', new:true },
  // Legacy fallback keys
  { key:'careerOverview',      icon:'📋', label:'Career Overview',           color:'#8B5CF6', new:false },
  { key:'demand',              icon:'📈', label:'Market Demand',             color:'#10B981', new:false },
  { key:'skills',              icon:'🛠️', label:'Skills',                    color:'#F59E0B', new:false },
  { key:'learningPath',        icon:'🎓', label:'Learning Path',             color:'#6366F1', new:false },
  { key:'salary',              icon:'💰', label:'Salary',                    color:'#10B981', new:false },
  { key:'growth',              icon:'🚀', label:'Career Growth',             color:'#8B5CF6', new:false },
  { key:'risks',               icon:'⚠️', label:'Risks',                     color:'#EF4444', new:false },
  { key:'opportunities',       icon:'✨', label:'Opportunities',             color:'#F59E0B', new:false },
  { key:'finalDecision',       icon:'🎯', label:'Recommendation',            color:'#10B981', new:false },
]

function WordCount({ text }) {
  if (!text) return null
  const count = text.trim().split(/\s+/).length
  return <span style={{ fontSize: '0.68rem', color: count > 200 ? '#10B981' : '#F59E0B', fontWeight: 600 }}>{count} words</span>
}

function Section({ s, content, index }) {
  const [open, setOpen] = useState(index < 2)
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: { delay: index * 0.025 } }}
      className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 8 }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: open ? '1px solid var(--border)' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>{s.icon}</span>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{String(index + 1).padStart(2, '0')}. {s.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <WordCount text={content} />
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>▼</motion.span>
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.9, color: 'var(--text-primary)' }}>
                <MessageRenderer content={content} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Reports() {
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [goal, setGoal]         = useState('')
  const [generating, setGen]    = useState(false)
  const [selected, setSelected] = useState(null)
  const [error, setError]       = useState('')
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(null)

  useEffect(() => {
    reportApi.getAll()
      .then(r => { const l = r.data.reports || []; setReports(l); if (l.length) setSelected(l[0]) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  const generate = async (e) => {
    e.preventDefault()
    if (!goal.trim()) return
    setGen(true); setError(''); setProgress(0)

    // Simulate progress while waiting for AI
    progressRef.current = setInterval(() => {
      setProgress(p => p < 90 ? p + Math.random() * 8 : p)
    }, 1500)

    try {
      const { data } = await reportApi.generate({ goal: goal.trim() })
      clearInterval(progressRef.current); setProgress(100)
      const rep = data.report
      setReports(p => [rep, ...p])
      setSelected(rep); setGoal('')
    } catch (err) {
      clearInterval(progressRef.current)
      setError(err.response?.data?.message || 'Report generation failed. Please try again.')
    }
    setTimeout(() => { setGen(false); setProgress(0) }, 500)
  }

  const printReport = () => {
    const el = document.getElementById('print-report')
    if (!el) return
    el.style.display = 'block'
    window.print()
    el.style.display = 'none'
  }

  // Get sections that have content
  const activeSections = selected ? SECTIONS.filter(s => selected.report?.[s.key]) : []

  // Calculate total word count
  const totalWords = selected ? Object.values(selected.report || {}).reduce((sum, v) => {
    if (typeof v === 'string') return sum + v.trim().split(/\s+/).length
    return sum
  }, 0) : 0

  return (
    <Layout>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>📊 <span className="gradient-text">R&D Intelligence Reports</span></h1>
            <p>2000-5000 word deep career research — 15 sections of premium consultant-level analysis</p>
          </div>
          {selected && <button className="btn btn-secondary btn-sm" onClick={printReport}>⬇️ Export PDF</button>}
        </div>
      </div>

      {/* Generate */}
      <div className="card card-purple" style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ marginBottom: 4 }}>🧠 Generate Deep Career Intelligence Report</h3>
          <p style={{ fontSize: '0.845rem' }}>Enter any career or role — get a 2000-5000 word professional research report with 15 comprehensive sections covering market data, salary, companies, learning roadmap, and more.</p>
        </div>
        <form onSubmit={generate} style={{ display: 'flex', gap: 10 }}>
          <input className="input" value={goal} onChange={e => setGoal(e.target.value)}
            placeholder="e.g. Full Stack Developer, Data Scientist, UX Designer, DevOps Engineer..."
            style={{ flex: 1 }} disabled={generating} />
          <button type="submit" className="btn btn-primary" disabled={generating} style={{ flexShrink: 0 }}>
            {generating ? <><div className="spinner" style={{ borderTopColor: 'white' }} /> Researching...</> : '🔬 Generate Report'}
          </button>
        </form>

        {generating && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--purple-light)' }}>🔬 Building your 15-section intelligence report...</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--purple-light)' }}>{Math.round(progress)}%</span>
            </div>
            <div className="progress-bar" style={{ height: 6, marginBottom: 12 }}>
              <motion.div
                className="progress-fill"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: 999 }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 6 }}>
              {[
                { label: 'Market research', icon: '🌍' },
                { label: 'Salary analysis', icon: '💰' },
                { label: 'Skill mapping', icon: '🗺️' },
                { label: 'Company research', icon: '🏢' },
                { label: 'Trend analysis', icon: '📈' },
                { label: 'Career paths', icon: '🚀' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.18 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 10px', borderRadius: 8,
                    background: 'rgba(139,92,246,0.08)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    fontSize: '0.72rem', fontWeight: 500, color: 'var(--purple-light)',
                  }}
                >
                  <motion.span
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  >
                    {s.icon}
                  </motion.span>
                  {s.label}
                </motion.div>
              ))}
            </div>
          </div>
        )}
        {error && <div className="alert alert-error" style={{ marginTop: 12 }}>⚠️ {error}</div>}
      </div>

      {loading ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 52 }} />)}</div>
      : reports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '56px 20px', border: '1px dashed var(--border-purple)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 14 }}>🔬</div>
          <h2 className="gradient-text" style={{ marginBottom: 8 }}>No reports yet</h2>
          <p style={{ marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>Generate your first deep career intelligence report. Each report contains 2000-5000 words of premium research across 15 comprehensive sections.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 18, alignItems: 'flex-start' }} className="reports-layout">
          {/* Sidebar */}
          <div className="card" style={{ padding: 10, position: 'sticky', top: 20 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, padding: '0 4px' }}>Reports ({reports.length})</div>
            {reports.map((rep, i) => (
              <div key={rep._id} onClick={() => setSelected(rep)} style={{ padding: '9px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 3, background: selected?._id === rep._id ? 'rgba(139,92,246,0.12)' : 'transparent', borderLeft: selected?._id === rep._id ? '2px solid var(--purple)' : '2px solid transparent', transition: 'var(--t)' }}>
                <div style={{ fontWeight: 500, fontSize: '0.835rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rep.goal}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(rep.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
            ))}
          </div>

          {/* Report content */}
          {selected ? (
            <motion.div key={selected._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              {/* Report header */}
              <div className="card card-purple" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 style={{ marginBottom: 5 }}>{selected.goal}</h2>
                    <p style={{ fontSize: '0.8rem', marginBottom: 10 }}>
                      Generated {new Date(selected.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span className="badge badge-purple">📊 {activeSections.length} Sections</span>
                      <span className="badge badge-green">📝 ~{totalWords.toLocaleString()} words</span>
                      <span className="badge badge-blue">🔬 Deep Research</span>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={printReport}>⬇️ PDF</button>
                </div>
              </div>

              {/* Animated Key Stats */}
              <div className="grid-4" style={{ marginBottom: 16 }}>
                <AnimatedStat icon="📝" value={totalWords} suffix="+" label="Research Words" color="#8B5CF6" />
                <AnimatedStat icon="📊" value={activeSections.length} label="Deep Sections" color="#6366F1" />
                <AnimatedStat icon="🔬" value="Research" label="Grade Quality" color="#10B981" />
                <AnimatedStat icon="🏆" value="Premium" label="AI Analysis" color="#F59E0B" />
              </div>

              {/* Sections */}
              {activeSections.length > 0
                ? activeSections.map((s, i) => <Section key={s.key} s={s} content={selected.report[s.key]} index={i} />)
                : <div className="card"><div className="empty-state"><span className="icon">📊</span><p>Report content not available</p></div></div>
              }
            </motion.div>
          ) : (
            <div className="card"><div className="empty-state"><span className="icon">📊</span><p>Select a report from the left</p></div></div>
          )}
        </div>
      )}

      {/* Printable */}
      <div id="print-report" style={{ display: 'none' }}>
        {selected && (
          <div style={{ fontFamily: 'Georgia, serif', color: '#111', padding: 48, maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', borderBottom: '3px solid #8B5CF6', paddingBottom: 24, marginBottom: 32 }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Career Intelligence Report</h1>
              <h2 style={{ fontSize: '1.5rem', color: '#8B5CF6', marginBottom: 10 }}>{selected.goal}</h2>
              <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Dream Wave AI · {new Date(selected.createdAt).toLocaleDateString()}</p>
            </div>
            {SECTIONS.map((s, i) => selected.report?.[s.key] ? (
              <div key={s.key} style={{ marginBottom: 28, pageBreakInside: 'avoid' }}>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#7C3AED', borderBottom: '1px solid #E5E7EB', paddingBottom: 8, marginBottom: 12 }}>
                  {s.icon} {String(i + 1).padStart(2, '0')}. {s.label}
                </h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.85, color: '#374151', whiteSpace: 'pre-line' }}>{selected.report[s.key]}</p>
              </div>
            ) : null)}
          </div>
        )}
      </div>
      <style>{`@media print { body>*{display:none!important} #print-report{display:block!important} }`}</style>
    </Layout>
  )
}
