import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { goalApi, taskApi } from '../services/api'

export default function Resume() {
  const { user }  = useAuth()
  const [goals, setGoals]  = useState([])
  const [tasks, setTasks]  = useState([])
  const [loading, setLoad] = useState(true)
  const [form, setForm]    = useState({ bio: '', phone: '', location: '', linkedin: '', github: '', skills: '', certifications: '' })

  useEffect(() => {
    Promise.all([goalApi.getAll(), taskApi.getAll()])
      .then(([g, t]) => { setGoals(g.data.goals || []); setTasks(t.data.tasks || []) })
      .catch(() => {}).finally(() => setLoad(false))
  }, [])

  const completedGoals = goals.filter(g => g.completed)
  const completedTasks = tasks.filter(t => t.completed)
  const skills  = form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : []
  const certs   = form.certifications ? form.certifications.split(',').map(c => c.trim()).filter(Boolean) : []
  const cats    = [...new Set(completedTasks.map(t => t.category).filter(Boolean))]

  const handlePrint = () => {
    const el = document.getElementById('resume-print')
    if (!el) return
    el.style.display = 'block'
    window.print()
    el.style.display = 'none'
  }

  const FIELDS = [
    { key:'bio',            label:'Professional Summary', multi: true,  ph:'A driven professional passionate about...' },
    { key:'phone',          label:'Phone',                multi: false, ph:'+91 98765 43210' },
    { key:'location',       label:'Location',             multi: false, ph:'Mumbai, India' },
    { key:'linkedin',       label:'LinkedIn URL',         multi: false, ph:'linkedin.com/in/yourname' },
    { key:'github',         label:'GitHub URL',           multi: false, ph:'github.com/yourname' },
    { key:'skills',         label:'Skills (comma-separated)', multi: false, ph:'React, Python, SQL, ...' },
    { key:'certifications', label:'Certifications (comma-separated)', multi: false, ph:'AWS Cloud, Google Analytics, ...' },
  ]

  return (
    <Layout>
      <div className="page-header">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div><h1>📄 <span className="gradient-text">Resume Builder</span></h1><p>ATS-friendly resume auto-generated from your Dream Wave journey</p></div>
          <button className="btn btn-primary" onClick={handlePrint}>⬇️ Download PDF</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:20, alignItems:'flex-start' }} className="resume-layout">
        {/* Editor */}
        <div className="card">
          <h3 style={{ marginBottom:14 }}>✏️ Your Details</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {FIELDS.map(({ key, label, multi, ph }) => (
              <div key={key} className="form-group">
                <label className="label">{label}</label>
                {multi ? <textarea className="textarea" value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))} placeholder={ph} rows={3} /> : <input className="input" value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))} placeholder={ph} />}
              </div>
            ))}
          </div>
          <div className="alert alert-info" style={{ marginTop:14 }}>💡 Completed goals and tasks are automatically included.</div>
        </div>

        {/* Preview */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
          <div style={{ background:'white', color:'#111', borderRadius:'var(--r-lg)', padding:36, boxShadow:'var(--shadow-lg)', fontFamily:"'Inter',sans-serif", maxWidth:700 }}>
            {/* Header */}
            <div style={{ borderBottom:'3px solid #8B5CF6', paddingBottom:18, marginBottom:18 }}>
              <h1 style={{ fontSize:'1.875rem', fontWeight:800, color:'#09090B', letterSpacing:'-0.02em', marginBottom:4 }}>{user?.name || 'Your Name'}</h1>
              {user?.aaid && <div style={{ fontSize:'0.75rem', color:'#6B7280', marginBottom:8 }}>Dream Wave ID: {user.aaid} | Level {user?.level||1}</div>}
              <div style={{ display:'flex', flexWrap:'wrap', gap:'5px 18px', fontSize:'0.84rem', color:'#374151' }}>
                {user?.email && <span>✉️ {user.email}</span>}
                {form.phone && <span>📞 {form.phone}</span>}
                {form.location && <span>📍 {form.location}</span>}
                {form.linkedin && <span>🔗 {form.linkedin}</span>}
                {form.github && <span>💻 {form.github}</span>}
              </div>
            </div>

            {form.bio && (
              <section style={{ marginBottom:18 }}>
                <h2 style={{ fontSize:'0.875rem', fontWeight:700, color:'#7C3AED', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:7 }}>Professional Summary</h2>
                <p style={{ fontSize:'0.875rem', color:'#374151', lineHeight:1.75 }}>{form.bio}</p>
              </section>
            )}

            {skills.length > 0 && (
              <section style={{ marginBottom:18 }}>
                <h2 style={{ fontSize:'0.875rem', fontWeight:700, color:'#7C3AED', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:9 }}>Skills</h2>
                <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                  {skills.map((s,i) => <span key={i} style={{ padding:'3px 11px', background:'#F5F3FF', color:'#7C3AED', borderRadius:999, fontSize:'0.8rem', fontWeight:500 }}>{s}</span>)}
                </div>
              </section>
            )}

            {completedGoals.length > 0 && (
              <section style={{ marginBottom:18 }}>
                <h2 style={{ fontSize:'0.875rem', fontWeight:700, color:'#7C3AED', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Completed Projects & Goals</h2>
                {completedGoals.map((g,i) => (
                  <div key={i} style={{ marginBottom:10, paddingLeft:14, borderLeft:'3px solid #DDD6FE' }}>
                    <div style={{ fontWeight:600, fontSize:'0.9rem', color:'#111', marginBottom:2 }}>✅ {g.title}</div>
                    <div style={{ fontSize:'0.78rem', color:'#6B7280', marginBottom:3 }}>{g.category} · Progress: 100%</div>
                    {g.description && <p style={{ fontSize:'0.85rem', color:'#374151' }}>{g.description}</p>}
                  </div>
                ))}
              </section>
            )}

            {completedTasks.length > 0 && (
              <section style={{ marginBottom:18 }}>
                <h2 style={{ fontSize:'0.875rem', fontWeight:700, color:'#7C3AED', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Learning Achievements</h2>
                <p style={{ fontSize:'0.85rem', color:'#374151', marginBottom:8 }}>Completed <strong>{completedTasks.length}</strong> structured learning tasks via Dream Wave AI, covering:</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {cats.map((c,i) => <span key={i} style={{ padding:'3px 10px', background:'#F0FDF4', color:'#15803D', borderRadius:999, fontSize:'0.78rem', fontWeight:500 }}>{c}</span>)}
                </div>
              </section>
            )}

            {certs.length > 0 && (
              <section style={{ marginBottom:18 }}>
                <h2 style={{ fontSize:'0.875rem', fontWeight:700, color:'#7C3AED', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Certifications</h2>
                {certs.map((c,i) => <div key={i} style={{ display:'flex', gap:7, marginBottom:5 }}><span style={{ color:'#10B981', fontWeight:700 }}>✓</span><span style={{ fontSize:'0.875rem', color:'#374151' }}>{c}</span></div>)}
              </section>
            )}

            <div style={{ borderTop:'1px solid #E5E7EB', paddingTop:10, marginTop:6, fontSize:'0.72rem', color:'#9CA3AF', textAlign:'center' }}>
              Generated by Dream Wave AI · {new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hidden printable */}
      <div id="resume-print" style={{ display:'none' }}>
        <style>{`@media print { body>*{display:none!important} #resume-print{display:block!important} }`}</style>
      </div>
      <style>{`@media print { body>*{display:none!important} #resume-print{display:block!important} }`}</style>
    </Layout>
  )
}
