import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const QUICK = [
  'I feel lost about my career path',
  'How do I stay motivated when things get hard?',
  'I am afraid of failure',
  'How to find my true purpose in life?',
  'I feel overwhelmed with too many choices',
  'How to balance studies and personal life?'
];

export default function Mentor() {
  const [messages, setMessages] = useState([{
    role: 'ai',
    text: 'Namaste 🙏\n\nDear seeker, I am here to guide you with the wisdom of the Bhagavad Gita.\n\n"You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions." — Gita 2.47\n\nWhat troubles your heart today?'
  }]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (msg) => {
    const text = (msg || input).trim();
    if (!text || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text }]);
    setLoading(true);
    try {
      const { data } = await api.post('/mentor', { message: text });
      setMessages(m => [...m, { role: 'ai', text: data.reply }]);
    } catch {
      setMessages(m => [...m, { role: 'ai', text: 'The divine connection was interrupted. Please try again, dear seeker.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex-shrink-0 mb-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl mx-auto mb-2 shadow-lg shadow-amber-500/30">
          🪷
        </div>
        <h1 className="text-xl font-black text-white">Krishna Mentor</h1>
        <p className="text-white/40 text-xs mt-0.5">Wisdom from the Bhagavad Gita</p>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'ai' && (
                <div className="flex items-end gap-2 max-w-[88%]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-base flex-shrink-0 mb-0.5">🪷</div>
                  <div className="bg-gradient-to-br from-amber-950/40 to-orange-950/30 border border-amber-500/20 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-amber-50/90 leading-relaxed whitespace-pre-wrap">
                    {m.text}
                  </div>
                </div>
              )}
              {m.role === 'user' && (
                <div className="max-w-[75%] bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl rounded-br-sm px-4 py-3 text-sm text-white">{m.text}</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">🪷</div>
              <div className="bg-amber-950/40 border border-amber-500/20 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: d+'ms' }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="flex-shrink-0 flex gap-2 flex-wrap mb-3">
        {QUICK.map((q, i) => (
          <button key={i} onClick={() => send(q)}
            className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300/80 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-colors">
            {q.length > 30 ? q.substring(0, 30) + '...' : q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask Krishna for guidance..."
          className="flex-1 bg-amber-950/20 border border-amber-500/20 rounded-xl px-4 py-3 text-white placeholder-amber-200/20 outline-none focus:border-amber-500/50 text-sm transition-colors" />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-5 py-3 rounded-xl disabled:opacity-40 hover:opacity-90 transition-opacity text-sm">
          Ask
        </button>
      </div>
    </div>
  );
}
