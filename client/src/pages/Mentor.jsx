import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { mentorApi } from '../services/api'
import MessageRenderer from '../components/MessageRenderer'
import AIOrb from '../components/animations/AIOrb'

const MODES = [
  { id: 'general',  label: 'General',  icon: '🧠', color: '#8B5CF6', desc: 'Universal wisdom & career guidance' },
  { id: 'hindu',    label: 'Vedic',    icon: '🕉️', color: '#F59E0B', desc: 'Wisdom from Bhagavad Gita & Indian philosophy' },
  { id: 'christian',label: 'Christian',icon: '✝️', color: '#60A5FA', desc: 'Guided by scripture and Christian values' },
  { id: 'muslim',   label: 'Islamic',  icon: '☪️', color: '#34D399', desc: 'Inspired by Quran and Islamic wisdom' },
]

const PROMPTS = [
  'I feel lost and don\'t know what to do',
  'I keep procrastinating on my goals',
  'How do I stay consistent every day?',
  'I failed today — help me get back up',
  'What should I focus on right now?',
  'How do I handle fear of failure?',
  'I completed a milestone — celebrate with me!',
  'Give me a powerful quote for motivation',
]

const MENTOR_NAMES = { general: 'Sage', hindu: 'Arjuna', christian: 'Grace', muslim: 'Nur' }

export default function Mentor() {
  const { user } = useAuth()
  const [mode, setMode] = useState('general')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  const mentorName = MENTOR_NAMES[mode]

  // Set welcome message when mode changes
  useEffect(() => {
    const welcomes = {
      general:   `Hey ${user?.name?.split(' ')[0] || 'there'} 👋 I'm Sage, your AI mentor. I'm here to guide you through your career journey, help you overcome challenges, and celebrate your wins. What's on your mind?`,
      hindu:     `Namaste ${user?.name?.split(' ')[0] || ''}! 🕉️ I am Arjuna, your Vedic wisdom guide. Like Krishna guided Arjuna on the battlefield of Kurukshetra, I am here to guide you through your journey. As the Gita says: "You have the right to perform your actions, but not to the fruits of action." Let us begin. What troubles your mind?`,
      christian: `Peace be with you, ${user?.name?.split(' ')[0] || 'friend'}! ✝️ I am Grace, here to walk alongside you. As Proverbs 3:5-6 says: "Trust in the Lord with all your heart and lean not on your own understanding." How can I support you today?`,
      muslim:    `Assalamu Alaikum, ${user?.name?.split(' ')[0] || 'friend'}! ☪️ I am Nur, your guide. As the Prophet (PBUH) taught: "The best among you is the one who benefits others most." Let us reflect together. What is on your mind?`,
    }
    setMessages([{ role: 'assistant', content: welcomes[mode], mode }])
  }, [mode, user?.name])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (msg) => {
    const text = (msg || input).trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)
    try {
      const { data } = await mentorApi.chat(text, mode)
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, mode }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a moment of silence. Give me a second and try again. 🙏", mode }])
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  const currentMode = MODES.find(m => m.id === mode)

  return (
    <Layout>
      <div className="page-header">
        <h1>🤖 AI Mentor — <span className="gradient-text">{mentorName}</span></h1>
        <p>Personal inspiration, career guidance, and emotional support — choose your wisdom tradition</p>
      </div>

      {/* Mode selector */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} style={{
            padding: '14px 12px', borderRadius: 'var(--r-lg)', border: `2px solid ${mode === m.id ? m.color : 'var(--border)'}`,
            background: mode === m.id ? `${m.color}15` : 'var(--bg-card)', cursor: 'pointer',
            textAlign: 'center', transition: 'var(--t)', boxShadow: mode === m.id ? `0 4px 20px ${m.color}30` : 'none',
          }}>
            <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{m.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: mode === m.id ? m.color : 'var(--text-primary)', marginBottom: 3 }}>{m.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{m.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }} className="mentor-layout">
        {/* Chat */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 520 }}>
          {/* Header */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', background: `${currentMode.color}0d`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <AIOrb state={loading ? 'thinking' : messages.length > 1 && messages[messages.length - 1]?.role === 'assistant' ? 'neural' : 'idle'} size={44} color={currentMode.color} />
            <div>
              <div style={{ fontWeight: 700 }}>{mentorName}</div>
              <div style={{ fontSize: '0.72rem', color: loading ? currentMode.color : '#34D399' }}>
                {loading ? '● Thinking...' : '● Always here for you'}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button
                onClick={() => mentorApi.clear().then(() => setMessages([messages[0]]))}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72rem', transition: 'var(--t)', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-purple)'; e.currentTarget.style.color='var(--text-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-muted)' }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 9 }}>
                  {m.role === 'assistant' && (
                    <div style={{ flexShrink: 0, alignSelf: 'flex-end' }}>
                      <AIOrb state="idle" size={28} color={currentMode.color} />
                    </div>
                  )}
                  <div style={{
                    maxWidth: m.role === 'user' ? '75%' : '92%',
                    padding: '12px 16px',
                    borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: m.role === 'user' ? `linear-gradient(135deg,var(--purple),var(--purple-mid))` : 'rgba(255,255,255,0.05)',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                    fontSize: '0.875rem', lineHeight: 1.68, color: 'var(--text-primary)',
                  }}>
                    {m.role === 'user'
                      ? <span style={{ whiteSpace: 'pre-wrap' }}>{m.content}</span>
                      : <MessageRenderer content={m.content} />
                    }
                  </div>
                  {m.role === 'user' && (
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0, alignSelf: 'flex-end', color: 'white' }}>
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div style={{ display: 'flex', gap: 9, alignItems: 'flex-end' }}>
                <AIOrb state="thinking" size={28} color={currentMode.color} />
                <div style={{ padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
                  <motion.p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}
                    animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    {mentorName} is composing a thoughtful response...
                  </motion.p>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
            <form onSubmit={e => { e.preventDefault(); send() }} style={{ display: 'flex', gap: 8 }}>
              <input ref={inputRef} className="input" value={input} onChange={e => setInput(e.target.value)} placeholder={`Talk to ${mentorName}...`} disabled={loading} style={{ flex: 1, borderColor: input ? 'var(--border-purple)' : 'var(--border)' }} />
              <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()} style={{ flexShrink: 0, background: `linear-gradient(135deg,${currentMode.color},${currentMode.color}cc)` }}>
                {loading ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : '↑'}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar — prompts */}
        <div className="mentor-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Quick Prompts</div>
            {PROMPTS.map((p, i) => (
              <button key={i} onClick={() => send(p)} style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', lineHeight: 1.45, marginBottom: 4, transition: 'var(--t)', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(139,92,246,0.1)'; e.currentTarget.style.color='var(--purple-light)' }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-secondary)' }}>
                {p}
              </button>
            ))}
          </div>
          <div className="card card-purple" style={{ padding: 14 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--purple-light)', marginBottom: 6 }}>About {mentorName}</div>
            <p style={{ fontSize: '0.77rem', lineHeight: 1.6 }}>{currentMode.desc}. Your mentor provides educational guidance and motivation based on this tradition.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
