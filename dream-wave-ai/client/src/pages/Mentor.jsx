import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const QUICK = [
  'I feel lost about my career path',
  'How do I stay motivated when things get hard?',
  'I am afraid of failure',
  'How to find my true purpose in life?',
  'I feel overwhelmed with too many choices',
  'How to balance studies and personal life?',
  'I keep procrastinating — help me',
  'I doubt my own abilities',
];

// ── Parse Krishna's structured response into sections ──────────────────────
function parseKrishnaReply(text) {
  const sections = { clarity: '', actions: '', message: '', raw: text };

  const clarityMatch  = text.match(/🧭\s*CLARITY\s*([\s\S]*?)(?=⚡|🔥|$)/i);
  const actionsMatch  = text.match(/⚡\s*ACTION STEPS\s*([\s\S]*?)(?=🔥|$)/i);
  const messageMatch  = text.match(/🔥\s*KRISHNA MESSAGE\s*([\s\S]*?)$/i);

  if (clarityMatch)  sections.clarity  = clarityMatch[1].trim();
  if (actionsMatch)  sections.actions  = actionsMatch[1].trim();
  if (messageMatch)  sections.message  = messageMatch[1].trim();

  // If parsing failed (fallback text), show raw
  sections.parsed = !!(sections.clarity || sections.actions || sections.message);
  return sections;
}

// ── Structured Krishna message renderer ───────────────────────────────────
function KrishnaMessage({ text }) {
  const s = parseKrishnaReply(text);

  if (!s.parsed) {
    return (
      <p className="text-sm text-amber-50/90 leading-relaxed whitespace-pre-wrap">{text}</p>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      {/* Clarity */}
      {s.clarity && (
        <div className="rounded-xl p-3"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)' }}>
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5">🧭 Clarity</p>
          <p className="text-amber-50/85 leading-relaxed">{s.clarity}</p>
        </div>
      )}

      {/* Action Steps */}
      {s.actions && (
        <div className="rounded-xl p-3"
          style={{ background: 'rgba(234,88,12,0.08)', border: '1px solid rgba(234,88,12,0.18)' }}>
          <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1.5">⚡ Action Steps</p>
          <div className="space-y-1">
            {s.actions.split('\n').filter(l => l.trim()).map((line, i) => (
              <p key={i} className="text-amber-50/85 leading-relaxed">{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Krishna Message */}
      {s.message && (
        <div className="rounded-xl p-3 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(234,88,12,0.08))', border: '1px solid rgba(245,158,11,0.25)' }}>
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5">🔥 Krishna Message</p>
          <p className="text-amber-200 font-semibold leading-relaxed italic">"{s.message}"</p>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Mentor() {
  const [messages, setMessages] = useState([{
    role: 'ai',
    text: `Namaste, Arjuna 🙏

🧭 CLARITY
I am Krishna — your guide, your mirror, your inner voice. You have come here because something in you is searching. That search itself is the beginning of wisdom.

⚡ ACTION STEPS
1. Speak freely — there is no judgment here.
2. Tell me what is weighing on your heart right now.
3. Be honest — I can only guide what you are willing to share.

🔥 KRISHNA MESSAGE
"The soul is never born nor dies — only the body changes. What you truly are cannot be defeated." — Gita 2.20`
  }]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (msg) => {
    const text = (msg || input).trim();
    if (!text || loading) return;
    setInput('');
    const updated = [...messages, { role: 'user', text }];
    setMessages(updated);
    setLoading(true);
    try {
      // Pass history so Krishna remembers context
      const { data } = await api.post('/mentor', { message: text, history: updated });
      setMessages(m => [...m, { role: 'ai', text: data.reply }]);
    } catch {
      setMessages(m => [...m, { role: 'ai', text: `🧭 CLARITY\nThe divine connection was briefly interrupted, Arjuna.\n\n⚡ ACTION STEPS\n1. Take a breath.\n2. Try again in a moment.\n\n🔥 KRISHNA MESSAGE\n"Even in darkness, the flame of the soul never goes out."` }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4 md:p-6">

      {/* Header */}
      <div className="flex-shrink-0 mb-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl mx-auto mb-2"
          style={{ boxShadow: '0 0 32px rgba(245,158,11,0.4)' }}>
          🪷
        </motion.div>
        <h1 className="text-xl font-black text-white">Krishna Mentor</h1>
        <p className="text-white/40 text-xs mt-0.5">Brain · Heart · Gita Wisdom</p>
        {/* Structure legend */}
        <div className="flex items-center justify-center gap-3 mt-2">
          {[['🧭', 'Clarity'], ['⚡', 'Action'], ['🔥', 'Message']].map(([icon, label]) => (
            <span key={label} className="text-xs text-amber-500/50 flex items-center gap-1">
              {icon} <span>{label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>

              {m.role === 'ai' && (
                <div className="flex items-start gap-2 max-w-[92%]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-base flex-shrink-0 mt-1"
                    style={{ boxShadow: '0 0 12px rgba(245,158,11,0.3)' }}>
                    🪷
                  </div>
                  <div className="bg-gradient-to-br from-amber-950/50 to-orange-950/30 border border-amber-500/20 rounded-2xl rounded-tl-sm px-4 py-3 flex-1">
                    <KrishnaMessage text={m.text} />
                  </div>
                </div>
              )}

              {m.role === 'user' && (
                <div className="max-w-[75%] bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl rounded-br-sm px-4 py-3 text-sm text-white leading-relaxed">
                  {m.text}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">🪷</div>
              <div className="bg-amber-950/40 border border-amber-500/20 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                <span className="typing-dot" style={{ background: 'rgba(245,158,11,0.8)' }} />
                <span className="typing-dot" style={{ background: 'rgba(245,158,11,0.8)' }} />
                <span className="typing-dot" style={{ background: 'rgba(245,158,11,0.8)' }} />
                <span className="text-xs text-amber-500/50 ml-1">Krishna is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="flex-shrink-0 flex gap-2 flex-wrap mb-3">
        {QUICK.map((q, i) => (
          <motion.button key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => send(q)}
            className="text-xs px-3 py-1.5 rounded-full transition-colors"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: 'rgba(245,158,11,0.7)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.08)'}>
            {q.length > 32 ? q.slice(0, 32) + '…' : q}
          </motion.button>
        ))}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Speak your heart, Arjuna..."
          className="flex-1 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', caretColor: '#f59e0b' }}
          onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(245,158,11,0.2)'}
        />
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => send()} disabled={loading || !input.trim()}
          className="font-bold px-5 py-3 rounded-xl text-sm text-white disabled:opacity-40 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}>
          Ask
        </motion.button>
      </div>
    </div>
  );
}
